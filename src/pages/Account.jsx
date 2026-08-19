import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import Pagination from '../components/Pagination'
import { useAuth } from '../store/authStore'
import { useCurrency } from '../store/currencyStore'
import { useCart } from '../store/cartStore'
import { useWishlist } from '../store/wishlistStore'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'

function ProfileSection() {
  const { user, updateSession } = useAuth()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const data = await api.put(ENDPOINTS.AUTH.ME, { name, email }, { auth: true })
      updateSession(data.user)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-slate-800 font-heading">Profile Details</h3>
      {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[13px] text-rose-700">{error}</div>}
      {saved && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-800">Profile saved successfully.</div>}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-6 py-2.5 shadow hover:shadow-md transition-all disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}

function PasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }
    setSaving(true)
    try {
      await api.put(
        ENDPOINTS.AUTH.PASSWORD,
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { auth: true }
      )
      setSaved(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-slate-800 font-heading">Change Password</h3>
      {error && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[13px] text-rose-700">{error}</div>}
      {saved && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-800">Password changed successfully.</div>}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Current Password</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-6 py-2.5 shadow hover:shadow-md transition-all disabled:opacity-60"
      >
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

function WishlistSection() {
  const { wishlist, loading, removeItem } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { format } = useCurrency()
  const [movingId, setMovingId] = useState(null)

  const handleMoveToCart = async (product) => {
    setMovingId(product.id)
    try {
      await addToCart(product)
      await removeItem(product.id)
    } catch (err) {
      console.error('Failed to move product to cart:', err)
    } finally {
      setMovingId(null)
    }
  }

  if (loading) {
    return <div className="text-[14px] text-slate-500 py-6 text-center">Loading wishlist...</div>
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 bg-white border border-slate-100 rounded-xl">
        <span className="text-[14px] text-slate-600 mb-3">Your wishlist is currently empty.</span>
        <Link
          to="/shop"
          className="rounded-xl bg-cz-sky/10 text-cz-primary hover:bg-cz-primary hover:text-white text-[13px] font-semibold px-6 py-2 transition-all"
        >
          Explore Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {wishlist.map((item) => {
        const product = item.product
        if (!product) return null
        return (
          <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex gap-3 items-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-14 h-14 object-contain rounded-lg shrink-0 border border-slate-100" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 shrink-0" />
              )}
              <div className="min-w-0">
                <Link to={`/product/${product.slug}`} className="text-[13px] font-semibold text-slate-800 hover:text-cz-primary line-clamp-2 leading-snug">
                  {product.name}
                </Link>
                <div className="text-[13px] font-bold text-cz-primary mt-1">{format(product.price)}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleMoveToCart(product)}
                disabled={movingId === product.id}
                className="flex-1 rounded-lg bg-cz-primary hover:bg-cz-primary-hover text-white text-[12px] font-semibold py-1.5 transition-all text-center"
              >
                {movingId === product.id ? 'Moving...' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="px-3 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-[12px] font-semibold transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const STATUS_LABEL = {
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  processing: 'Processing Order',
  dispatched: 'Dispatched & Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLOR = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  dispatched: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function Account() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `My Account — Orders & Profile | ${siteName || 'IT Solutions'}`,
    canonical: `${window.location.origin}/account`,
    noindex: true,
  })

  const { user, logout, initializing } = useAuth()
  const { format } = useCurrency()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [copiedOrderId, setCopiedOrderId] = useState(null)

  const isNewUser = useRef(false)
  const isFirstRender = useRef(true)

  if (isFirstRender.current) {
    isFirstRender.current = false
    if (user?.id) {
      const isNew = Boolean(location.state?.isNewUser)
      isNewUser.current = isNew
      sessionStorage.setItem(`order_history_cache_${user.id}`, JSON.stringify({ isNewUser: isNew }))
    }
  }

  useEffect(() => {
    if (!user) return

    if (isNewUser.current) {
      setOrders([])
      setOrdersTotalPages(1)
      setLoading(false)
      return
    }

    if (isNewUser.current && ordersPage !== 1) {
      setOrdersPage(1)
      return
    }

    setLoading(true)
    api
      .get(ENDPOINTS.ORDERS.BY_USER(user.id, `?page=${ordersPage}`), { auth: true })
      .then((data) => {
        setOrders(data.orders)
        setOrdersTotalPages(data.totalPages)
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user, ordersPage])

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
        {/* Left-Aligned Title Heading (Symmetrically Aligned to 1000px & No Home/Account Breadcrumb) */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            My Account
          </h1>
          <SeoHeadingFiller h4="Account tabs" h5="Account settings" h6="Support links" />
        </div>

        {location.state?.orderPlaced && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] px-5 py-4 mb-6 shadow-sm flex items-center gap-2">
            <span>🎉</span>
            <span>Your order has been placed successfully. We&apos;ll update the status here as it progresses.</span>
          </div>
        )}

        {/* User Account Info Header Card */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-xl border border-slate-100 p-5 mb-6 shadow-sm">
          <div>
            <div className="text-[17px] font-bold text-slate-800 font-heading">{user.name}</div>
            <div className="text-[13px] text-slate-500">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold px-5 py-2 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Profile & Password Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <ProfileSection />
          <PasswordSection />
        </div>

        {/* Wishlist Section */}
        <div className="mb-8">
          <h2 className="text-[18px] font-bold text-slate-800 font-heading mb-3">Wishlist</h2>
          <WishlistSection />
        </div>

        {/* Order History & Package Order Tracking Section */}
        <div>
          <h2 className="text-[18px] font-bold text-slate-800 font-heading mb-3">Order History & Tracking</h2>

          {loading ? (
            <div className="text-[14px] text-slate-500 py-10 text-center bg-white rounded-xl border border-slate-100">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 bg-white border border-slate-100 rounded-xl mb-8">
              <span className="text-[14px] text-slate-600 mb-4">You haven&apos;t placed any orders yet.</span>
              <Link
                to="/shop"
                className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-6 py-2.5 shadow hover:shadow-md transition-all"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-8">
              {orders.map((order) => {
                const colorClass = STATUS_COLOR[order.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-[15px] font-bold text-slate-800 font-heading">Order #{order.id}</div>
                        <div className="text-[12px] text-slate-400">
                          {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <span className={`rounded-lg border text-[12px] font-semibold px-3 py-1 ${colorClass}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 mb-3">
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

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[14px] font-bold text-slate-800">
                      <span>Total Amount</span>
                      <span className="text-cz-primary">{format(order.total_amount)}</span>
                    </div>

                    {/* Order Courier Package Tracking Box */}
                    {order.tracking_number && (
                      <div className="mt-4 rounded-xl border border-sky-200 bg-[#f0f9ff] p-4">
                        <div className="text-[13px] font-bold text-[#0891b2] mb-2 flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Package Tracking ({order.courier_name || 'Leopards Courier'})</span>
                        </div>
                        <ol className="text-[12px] text-slate-700 list-decimal list-inside space-y-1 mb-3">
                          <li>
                            Tracking Number:{' '}
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{order.tracking_number}</span>
                          </li>
                          <li>Click &quot;Track Package&quot; to view live delivery status</li>
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
                    )}
                  </div>
                )
              })}
              <Pagination page={ordersPage} totalPages={ordersTotalPages} onChange={setOrdersPage} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
