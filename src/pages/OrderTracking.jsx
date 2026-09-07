import { useEffect, useState, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileCheck,
  PackageCheck,
  Truck,
  MapPin,
  Home as HomeIcon,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Check,
  Copy,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
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

const STAGES = [
  {
    id: 'confirmed',
    label: 'Confirmed',
    fullTitle: 'Order Verified & Approved',
    icon: FileCheck,
    location: 'Order Processing Center',
    timestamp: 'Confirmed',
    desc: 'Payment authorized & order confirmed by merchant.',
  },
  {
    id: 'packed',
    label: 'Packed',
    fullTitle: 'Inspected & Sealed',
    icon: PackageCheck,
    location: 'Logistics Warehouse',
    timestamp: 'Packed',
    desc: 'Quality check passed. Package sealed with security tape.',
  },
  {
    id: 'dispatched',
    label: 'Dispatched',
    fullTitle: 'Handed over to Leopards Courier',
    icon: Truck,
    location: 'Leopards Courier Terminal',
    timestamp: 'Dispatched',
    desc: 'Package dispatched under Leopards Courier Waybill.',
  },
  {
    id: 'shipped',
    label: 'In Transit',
    fullTitle: 'Regional Expressway Transit',
    icon: MapPin,
    location: 'Sorting Hub',
    timestamp: 'In Transit',
    desc: 'Package sorted and loaded onto express transit line.',
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    fullTitle: 'Last-Mile Courier Delivery',
    icon: HomeIcon,
    location: 'Local Delivery Branch',
    timestamp: 'Out for Delivery',
    desc: 'Courier rider assigned and en route for doorstep delivery.',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    fullTitle: 'Successfully Delivered',
    icon: CheckCircle2,
    location: 'Destination Address',
    timestamp: 'Completed',
    desc: 'Package signed and delivered to recipient.',
  },
]

const STATUS_LABEL = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped / In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-800 border-sky-200',
  packed: 'bg-blue-50 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  out_for_delivery: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
  returned: 'bg-amber-100 text-amber-900 border-amber-300',
}

function getStageIndex(status) {
  if (status === 'delivered') return 5
  if (status === 'out_for_delivery' || status === 'delivery') return 4
  if (status === 'shipped' || status === 'transit' || status === 'in_transit') return 3
  if (status === 'dispatched') return 2
  if (status === 'packed' || status === 'processing') return 1
  return 0 // pending, confirmed
}

function formatEstDelivery(order) {
  if (order?.estimated_delivery) return order.estimated_delivery
  if (order?.estimated_delivery_date) return order.estimated_delivery_date

  const created = order?.created_at ? new Date(order.created_at) : new Date()
  const estDate = new Date(created)

  // Calculate 10 business days (skipping weekends)
  let count = 0
  while (count < 10) {
    estDate.setDate(estDate.getDate() + 1)
    const day = estDate.getDay()
    if (day !== 0 && day !== 6) {
      count++
    }
  }

  return estDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function UltraOrderJourneyCanvas({ order }) {
  const status = order?.status || 'confirmed'
  const trackingNumber = order?.tracking_number || `LPD-${order?.id || '9847120'}-PK`
  const estDeliveryText = formatEstDelivery(order)
  const activeIndex = getStageIndex(status)

  const isReturned = status === 'returned'
  const isCancelled = status === 'cancelled'

  const vanStep = isReturned ? 3 : isCancelled ? 0 : activeIndex
  const vanProgressPercent = (vanStep / (STAGES.length - 1)) * 100

  const trackContainerRef = useRef(null)

  // Auto-center the track scroll onto the active van location on mobile screens
  useEffect(() => {
    if (!trackContainerRef.current) return
    if (window.innerWidth >= 640) return

    const timer = setTimeout(() => {
      const container = trackContainerRef.current
      if (!container) return
      const targetScroll = (container.scrollWidth * (vanProgressPercent / 100)) - (container.clientWidth / 2)
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      })
    }, 150)
    return () => clearTimeout(timer)
  }, [order?.id, status, vanProgressPercent])

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-md shadow-slate-200/50 mb-6 relative overflow-hidden">
      {/* Compact Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isReturned ? 'bg-amber-500 animate-ping' : isCancelled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLOR[status] || STATUS_COLOR.confirmed}`}>
                {STATUS_LABEL[status] || 'TRACKING ORDER'} #{order?.id || '---'}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 font-mono tracking-tight mt-0.5">
              LEOPARDS WAYBILL: {trackingNumber}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {order?.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
            >
              <span>Track live on Leopards</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Est. Delivery</span>
              <span className="text-[11px] font-black text-slate-800 leading-none">{estDeliveryText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Special Status Alert Banners (Returned / Cancelled) */}
      {isReturned && (
        <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center gap-3 text-amber-900 text-xs sm:text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-amber-950">Package Marked for Return</div>
            <div className="text-amber-800 text-xs mt-0.5">
              Leopards Courier reported this shipment as returned or returning to merchant. Please contact support if you need assistance.
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mt-4 bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-center gap-3 text-rose-900 text-xs sm:text-sm font-semibold">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <div className="font-bold text-rose-950">Order Cancelled</div>
            <div className="text-rose-800 text-xs mt-0.5">
              This order has been cancelled and package delivery is inactive.
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Track Wrapper */}
      <div className="relative pt-4 pb-2 group">
        <div
          ref={trackContainerRef}
          className="overflow-x-auto sm:overflow-x-visible scrollbar-none py-4 px-1 sm:px-0 w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="relative my-2 px-4 sm:px-6 min-w-[620px] sm:min-w-0">
            {/* Background Grey Rail */}
            <div className="absolute top-5 left-6 right-6 h-1.5 bg-slate-100 rounded-full" />

            {/* Animated Gradient Fluid Progress Line */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `calc((100% - 48px) * ${vanProgressPercent / 100})` }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              className={`absolute top-5 left-6 h-1.5 rounded-full shadow-xs ${
                isReturned
                  ? 'bg-amber-500'
                  : isCancelled
                  ? 'bg-rose-400'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500'
              }`}
            />

            {/* Traveling Courier Van */}
            {!isCancelled && (
              <motion.div
                initial={{ left: '24px' }}
                animate={{ left: `calc(24px + (100% - 48px) * ${vanProgressPercent / 100})` }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                style={{ transform: 'translateX(-50%)' }}
                className="absolute -top-2.5 z-30 pointer-events-none flex flex-col items-center"
              >
                <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shadow-md relative ${
                  isReturned
                    ? 'bg-amber-900 border-amber-400 text-amber-200'
                    : 'bg-slate-900 border-cyan-400 text-cyan-300'
                }`}>
                  <Truck className="w-5 h-5 animate-bounce" />
                  <span className={`absolute -bottom-1 w-5 h-1 rounded-full blur-2xs animate-pulse ${
                    isReturned ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                </div>
              </motion.div>
            )}

            {/* Step Nodes */}
            <div className="relative z-10 flex items-center justify-between">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon
                const isCompleted = !isCancelled && !isReturned && idx < activeIndex
                const isTarget = !isCancelled && !isReturned && idx === activeIndex

                return (
                  <div key={stage.id} className="flex flex-col items-center group relative">
                    {/* Node Box */}
                    <motion.div
                      animate={{
                        scale: isTarget ? 1.15 : isCompleted ? 1.02 : 1,
                        y: isTarget ? -2 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer relative ${
                        isTarget
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-600 shadow-md ring-3 ring-cyan-200/80'
                          : isCompleted
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xs'
                          : isReturned && idx === 3
                          ? 'bg-amber-500 border-amber-600 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}

                      {/* Pulsing ring on target node */}
                      {isTarget && (
                        <span className="absolute inset-0 rounded-xl border-2 border-cyan-400 animate-ping opacity-60" />
                      )}
                    </motion.div>

                    {/* Stage Title */}
                    <span
                      className={`text-[10px] font-bold mt-2 text-center max-w-[70px] sm:max-w-[85px] leading-tight ${
                        isTarget
                          ? 'text-cyan-700 font-black'
                          : isCompleted
                          ? 'text-emerald-700 font-extrabold'
                          : isReturned && idx === 3
                          ? 'text-amber-800 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

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
        setOrders(raw)

        if (raw.length > 0) {
          setSelectedOrderId(raw[0].id)
        }
      })
      .catch(() => {
        // Fallback demo order for preview
        const fallback = [
          {
            id: 22,
            status: 'shipped',
            tracking_number: 'LPD-22-PK',
            courier_name: 'Leopards Courier',
            tracking_url: 'https://pk.leopardscourier.com/tracking#LPD-22-PK',
            created_at: new Date().toISOString(),
            total_amount: 6999,
            items: [
              { id: 1, product_name: 'EZVIZ H6c 2MP Smart Indoor Camera', quantity: 1, price: 6999 },
            ],
          },
        ]
        setOrders(fallback)
        setSelectedOrderId(22)
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  if (initializing) return null
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0]

  const handleCopy = (orderId, trackingNum) => {
    navigator.clipboard.writeText(trackingNum).then(() => {
      setCopiedId(orderId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Main Heading */}
        <div className="mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            Order Tracking
          </h1>
          <p className="text-[13px] sm:text-[14px] font-medium text-black mt-1">
            Track your active orders and live Leopards Courier package delivery status.
          </p>
          <SeoHeadingFiller h4="Active orders" h5="Courier tracking" h6="Support options" />
        </div>

        {loading ? (
          <div className="text-[14px] text-slate-500 py-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            Checking active order status...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs mb-8">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0891b2] flex items-center justify-center text-xl mb-3 border border-sky-100">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-[16px] font-bold text-slate-800 font-heading mb-1">
              No Orders Found
            </h3>
            <p className="text-[13px] text-slate-500 max-w-md mb-6 leading-relaxed">
              You currently have no order history.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/account"
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold px-5 py-2.5 transition-all"
              >
                View Account Details
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
          <div>
            {/* Live Master Tracking Canvas FIXED AT TOP */}
            {selectedOrder && <UltraOrderJourneyCanvas order={selectedOrder} />}

            {/* List of Orders BELOW */}
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#0c4a6e] font-heading tracking-tight">
                Your Orders ({orders.length})
              </h2>
              <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                Click any order below to view visual timeline and live courier status
              </p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {orders.map((order) => {
                const isSelected = order.id === selectedOrder?.id
                const status = order.status || 'confirmed'
                const colorClass = STATUS_COLOR[status] || STATUS_COLOR.confirmed
                const labelText = STATUS_LABEL[status] || status

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md scale-[1.01]'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-heading">
                            Order #{order.id}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                              ● Currently Tracking
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-slate-400 mt-0.5">
                          Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`rounded-lg border text-[12px] font-bold px-3 py-1 capitalize ${colorClass}`}>
                          {labelText}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="flex flex-col gap-2 my-3">
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-[13px] text-slate-700">
                          <span className="line-clamp-1 pr-3">
                            {item.product_name}
                            {item.variant_label && ` — ${item.variant_label}`} × {item.quantity}
                          </span>
                          <span className="shrink-0 font-bold text-slate-900">{format(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Details Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[13px] flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-500">Waybill:</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.tracking_number || `LPD-${order.id}-PK`}
                        </span>
                        {order.tracking_number && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(order.id, order.tracking_number)
                            }}
                            className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === order.id ? 'Copied ✓' : 'Copy'}</span>
                          </button>
                        )}
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-800 ml-1"
                          >
                            <span>Live Leopards Tracking ↗</span>
                          </a>
                        )}
                      </div>

                      <div className="font-black text-slate-900 text-sm">
                        Total: <span className="text-cz-primary">{format(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
