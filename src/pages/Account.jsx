import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import Pagination from '../components/Pagination'
import SearchableCitySelect from '../components/SearchableCitySelect'
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
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || user?.saved_phone || '')
  const [address, setAddress] = useState(user?.saved_address || '')
  const [city, setCity] = useState(user?.saved_city || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const data = await api.put(
        ENDPOINTS.AUTH.ME,
        { name, email, phone, saved_phone: phone, saved_address: address, saved_city: city },
        { auth: true }
      )
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
      <h3 className="text-[16px] font-bold text-slate-800 font-heading pb-2.5 border-b border-slate-100">
        Profile & Shipping Details
      </h3>
      {error && <div className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">{error}</div>}
      {saved && (
        <div className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg font-semibold">
          ✨ Profile & shipping address updated successfully. Any unshipped orders have automatically been updated.
        </div>
      )}
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
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="03001234567"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Default Delivery Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House / Street address"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
          />
        </div>
        <div>
          <SearchableCitySelect value={city} onChange={setCity} label="City" />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-6 py-2.5 shadow hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
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
        ENDPOINTS.AUTH.CHANGE_PASSWORD,
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { auth: true }
      )
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
      <h3 className="text-[16px] font-bold text-slate-800 font-heading pb-2.5 border-b border-slate-100">
        Change Password
      </h3>
      {error && <div className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">{error}</div>}
      {saved && <div className="text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg font-semibold">✨ Password updated successfully.</div>}
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
          minLength={8}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
        <p className="text-[12px] text-slate-400 mt-1">At least 8 characters.</p>
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-6 py-2.5 shadow hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Change Password'}
        </button>
      </div>
    </form>
  )
}

function WishlistSection() {
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { format } = useCurrency()

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-5 text-[14px] text-slate-500 shadow-sm">
        Your wishlist is empty.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3 shadow-sm hover:shadow-md transition-all">
          <div className="w-[64px] h-[64px] rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
            <img src={item.image} alt={item.title} width={64} height={64} className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex-1 min-w-0">
            <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="text-[13px] font-semibold text-slate-800 line-clamp-2 hover:text-cz-primary transition-colors">
              {item.title}
            </Link>
            <div className="text-[14px] font-bold text-cz-primary mt-1">{format(item.price)}</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  addToCart({ id: item.id, slug: item.slug, title: item.title, image: item.image, price: item.price }, 1)
                  removeFromWishlist(item.id)
                }}
                disabled={item.stock != null && item.stock <= 0}
                className="text-[12px] font-semibold text-cz-primary hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {item.stock != null && item.stock <= 0 ? 'Out of stock' : 'Move to Cart'}
              </button>
              <button type="button" onClick={() => removeFromWishlist(item.id)} className="text-[12px] font-medium text-slate-400 hover:text-rose-600 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const STATUS_LABEL = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
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
  returned: 'bg-slate-50 text-slate-700 border-slate-200',
}

export default function Account() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `My Account — Orders, Wishlist & Settings | ${siteName || 'IT Solutions'}`,
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
  const prevUserId = useRef(user?.id)

  useEffect(() => {
    if (!user) return

    const isNewUser = prevUserId.current !== user.id
    prevUserId.current = user.id
    if (isNewUser && ordersPage !== 1) {
      setOrdersPage(1)
      return
    }

    setLoading(true)
    api
      .get(ENDPOINTS.ORDERS.BY_USER(user.id, `?page=${ordersPage}`), { auth: true })
      .then((data) => {
        setOrders(Array.isArray(data?.orders) ? data.orders : [])
        setOrdersTotalPages(data?.totalPages || 1)
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
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Ocean Navy Title Heading (No Breadcrumbs) */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            My Account
          </h1>
          <SeoHeadingFiller h4="Account tabs" h5="Account settings" h6="Support links" />
        </div>

        {location.state?.orderPlaced && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] px-5 py-4 mb-6 font-medium shadow-sm">
            ✨ Your order has been placed successfully. We&apos;ll update the status here as it progresses.
          </div>
        )}

        {/* User Info Header Bar */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 mb-6 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[17px] font-bold text-slate-800 font-heading">{user.name}</div>
            <div className="text-[13px] text-slate-500 mt-0.5">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold px-5 py-2 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Profile & Password Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <ProfileSection />
          <PasswordSection />
        </div>

        {/* Wishlist Section */}
        <h2 className="text-[18px] font-bold text-[#0c4a6e] font-heading mb-3">Wishlist</h2>
        <div className="mb-8">
          <WishlistSection />
        </div>

        {/* Order History Section */}
        <h2 className="text-[18px] font-bold text-[#0c4a6e] font-heading mb-3">Order History</h2>

        {loading ? (
          <div className="text-[14px] text-slate-500 py-10 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5 bg-white border border-slate-100 rounded-xl shadow-sm mb-8">
            <span className="text-[15px] font-semibold text-slate-800 mb-4">You haven&apos;t placed any orders yet.</span>
            <Link
              to="/shop"
              className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-7 py-3 shadow hover:shadow-md transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {orders.map((order) => {
              const colorClass = STATUS_COLOR[order.status] || 'bg-slate-50 text-slate-700 border-slate-200'
              return (
                <div key={order.id} className="bg-white rounded-xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-[15px] font-bold text-slate-800 font-heading">Order #{order.id}</div>
                      <div className="text-[12px] text-slate-400 mt-0.5">
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
                        <li>Click &quot;Track Package&quot; below to open live delivery status</li>
                      </ol>
                      <div className="flex items-center flex-wrap gap-2">
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
      </main>

      <Footer />
    </div>
  )
}
