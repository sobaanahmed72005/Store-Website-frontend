import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'

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
      const data = await api.put('/auth/me', { name, email }, { auth: true })
      updateSession(data.user)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[10px] border border-[#dedede] p-5 flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-[#212121]">Profile Details</h3>
      {error && <div className="text-[13px] text-red-600">{error}</div>}
      {saved && <div className="text-[13px] text-green-700">Saved.</div>}
      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
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
        '/auth/change-password',
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
    <form onSubmit={handleSubmit} className="rounded-[10px] border border-[#dedede] p-5 flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-[#212121]">Change Password</h3>
      {error && <div className="text-[13px] text-red-600">{error}</div>}
      {saved && <div className="text-[13px] text-green-700">Password updated.</div>}
      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Current Password</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
        <p className="text-[12px] text-[#9ca3af] mt-1">At least 8 characters.</p>
      </div>
      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
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
      <div className="rounded-[10px] border border-[#dedede] p-5 text-[14px] text-[#4b4b4b]">
        Your wishlist is empty.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[10px] border border-[#dedede] p-4 flex gap-3">
          <img src={item.image} alt={item.title} className="w-[64px] h-[64px] object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <Link to={item.slug ? `/product/${item.slug}` : '/products'} className="text-[14px] font-medium text-[#212121] line-clamp-2 hover:text-cz-primary">
              {item.title}
            </Link>
            <div className="text-[14px] text-[#212121] mt-1">{format(item.price)}</div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  addToCart({ id: item.id, slug: item.slug, title: item.title, image: item.image, price: item.price }, 1)
                  removeFromWishlist(item.id)
                }}
                disabled={item.stock != null && item.stock <= 0}
                className="text-[12px] font-medium text-cz-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {item.stock != null && item.stock <= 0 ? 'Out of stock' : 'Move to Cart'}
              </button>
              <button type="button" onClick={() => removeFromWishlist(item.id)} className="text-[12px] text-gray-500 hover:text-red-500">
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
  pending_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export default function Account() {
  useSeo({ title: 'My Account', noindex: true })
  const { user, logout } = useAuth()
  const { format } = useCurrency()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!user) return
    api
      .get(`/orders/user/${user.id}`, { auth: true })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  const handleResendVerification = async () => {
    setResending(true)
    try {
      await api.post('/auth/resend-verification', {}, { auth: true })
      setResent(true)
    } catch {
      // ignore
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5 flex-1 w-full">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">My Account</h1>
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>Account</span>
          </div>
        </section>

        {location.state?.orderPlaced && (
          <div className="rounded-[10px] bg-cz-gold-light text-cz-ink text-[14px] px-5 py-4 mb-6">
            Your order has been placed successfully. We&apos;ll update the status here as it progresses.
          </div>
        )}

        {!user.email_verified && (
          <div className="flex items-center justify-between flex-wrap gap-3 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 text-[14px] px-5 py-4 mb-6">
            <span>
              {resent
                ? 'Verification email sent — please check your inbox.'
                : 'Please verify your email address. Check your inbox for the verification link.'}
            </span>
            {!resent && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="rounded-full border border-amber-700 text-amber-900 hover:bg-amber-700 hover:text-white text-[13px] font-medium px-4 py-2 transition-colors disabled:opacity-60 shrink-0"
              >
                {resending ? 'Sending...' : 'Resend Email'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 rounded-[10px] border border-[#dedede] p-5 mb-6">
          <div>
            <div className="text-[16px] font-semibold text-[#212121]">{user.name}</div>
            <div className="text-[14px] text-[#4b4b4b]">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[14px] font-medium px-6 py-2.5 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
          <ProfileSection />
          <PasswordSection />
        </div>

        <h2 className="text-[18px] font-semibold text-[#212121] mb-3">Wishlist</h2>
        <div className="mb-10">
          <WishlistSection />
        </div>

        <h2 className="text-[18px] font-semibold text-[#212121] mb-3">Order History</h2>

        {loading ? (
          <div className="text-[14px] text-[#4b4b4b] py-10 text-center">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-[#dedede] rounded-[10px] mb-10">
            <span className="text-[15px] text-[#212121] mb-4">You haven&apos;t placed any orders yet.</span>
            <Link
              to="/"
              className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-10">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[10px] border border-[#dedede] p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="text-[14px] font-semibold text-[#212121]">Order #{order.id}</div>
                    <div className="text-[13px] text-[#4b4b4b]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="rounded-full bg-cz-gold-light text-cz-ink text-[12px] font-medium px-3 py-1">
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[13px] text-[#4b4b4b]">
                      <span className="line-clamp-1 pr-3">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="shrink-0">{format(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#dedede] text-[14px] font-semibold text-[#212121]">
                  <span>Total</span>
                  <span>{format(order.total_amount)}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-[#dedede] text-[13px]">
                    <span className="text-[#4b4b4b]">
                      {order.courier_name || 'Courier'}: <span className="text-[#212121] font-medium">{order.tracking_number}</span>
                    </span>
                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[13px] font-medium px-4 py-1.5 transition-colors"
                      >
                        Track Package
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
