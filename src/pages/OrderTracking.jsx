import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { useAuth } from '../store/authStore'
import { useCurrency } from '../store/currencyStore'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'

const STATUS_LABEL = {
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  processing: 'Processing Order',
  dispatched: 'Dispatched & Shipped',
}

const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-800 border-sky-200',
  processing: 'bg-blue-50 text-blue-800 border-blue-200',
  dispatched: 'bg-indigo-50 text-indigo-800 border-indigo-200',
}

export default function OrderTracking() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Order Tracking — Active Orders | ${siteName || 'IT Solutions'}`,
    canonical: `${window.location.origin}/order-tracking`,
    noindex: true,
  })

  const { user, initializing } = useAuth()
  const { format } = useCurrency()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedOrderId, setCopiedOrderId] = useState(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .get(ENDPOINTS.ORDERS.BY_USER(user.id, '?limit=100'), { auth: true })
      .then((data) => {
        const raw = Array.isArray(data?.orders) ? data.orders : []
        // Keep ONLY active in-progress orders (exclude delivered & cancelled)
        const activeOnly = raw.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
        setOrders(activeOnly)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (initializing) return null
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  const handleCopyTracking = (orderId, trackingNumber) => {
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopiedOrderId(orderId)
      setTimeout(() => setCopiedOrderId((current) => (current === orderId ? null : current)), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Title Heading */}
        <div className="mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            Order Tracking
          </h1>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1">
            Track your active, in-progress orders and live courier package delivery status.
          </p>
          <SeoHeadingFiller h4="Active orders" h5="Courier tracking" h6="Support options" />
        </div>

        {loading ? (
          <div className="text-[14px] text-slate-500 py-12 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
            Checking active order status...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5 bg-white border border-slate-100 rounded-xl shadow-sm mb-8">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0891b2] flex items-center justify-center text-xl mb-3 border border-sky-100">
              📦
            </div>
            <h3 className="text-[16px] font-bold text-slate-800 font-heading mb-1">
              No Active Orders In Progress
            </h3>
            <p className="text-[13px] text-slate-500 max-w-md mb-6 leading-relaxed">
              You currently have no orders in progress. Completed and past orders can be viewed in your full account history.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/account"
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold px-5 py-2.5 transition-all"
              >
                View Full Account & History
              </Link>
              <Link
                to="/shop"
                className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-6 py-2.5 shadow hover:shadow-md transition-all"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 mb-8">
            {orders.map((order) => {
              const colorClass = STATUS_COLOR[order.status] || 'bg-slate-50 text-slate-700 border-slate-200'
              return (
                <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-[16px] font-bold text-slate-800 font-heading">
                        Order #{order.id}
                      </div>
                      <div className="text-[12px] text-slate-400 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span className={`rounded-lg border text-[12px] font-semibold px-3.5 py-1 ${colorClass}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="flex flex-col gap-2 mb-4">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-[13px] text-slate-600">
                        <span className="line-clamp-1 pr-3">
                          {item.product_name}
                          {item.variant_label && ` — ${item.variant_label}`} × {item.quantity}
                        </span>
                        <span className="shrink-0 font-medium text-slate-800">{format(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[14px] font-bold text-slate-800 mb-4">
                    <span>Total Amount</span>
                    <span className="text-cz-primary">{format(order.total_amount)}</span>
                  </div>

                  {/* Live Courier Package Tracking Box */}
                  {order.tracking_number ? (
                    <div className="rounded-xl border border-sky-200 bg-[#f0f9ff] p-4">
                      <div className="text-[13px] font-bold text-[#0891b2] mb-2 flex items-center gap-1.5">
                        <span>📦</span>
                        <span>Package Tracking ({order.courier_name || 'Leopards Courier'})</span>
                      </div>
                      <ol className="text-[12px] text-slate-700 list-decimal list-inside space-y-1 mb-3">
                        <li>
                          Tracking Number:{' '}
                          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{order.tracking_number}</span>
                        </li>
                        <li>Click &quot;Track Package&quot; below to open live delivery status</li>
                      </ol>
                      <div className="flex items-center flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(order.id, order.tracking_number)}
                          className="rounded-lg bg-[#0891b2] hover:bg-[#0c4a6e] text-white text-[12px] font-semibold px-4 py-2 transition-all shadow"
                        >
                          {copiedOrderId === order.id ? 'Copied ✓' : 'Copy Tracking Number'}
                        </button>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white text-[12px] font-semibold px-4 py-2 transition-all"
                          >
                            Track Package →
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[12px] text-slate-600 flex items-center justify-between gap-3">
                      <span>📦 Your order is being packed and prepared for dispatch. Tracking details will appear here as soon as courier booking is complete.</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
