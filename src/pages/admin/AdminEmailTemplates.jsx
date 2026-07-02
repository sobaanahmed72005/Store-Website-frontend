import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const TEMPLATE_DEFAULTS = {
  signup: { subject: 'Verify your email address', message: "Thanks for creating an account with us! To get started, please verify your email address by clicking the button below." },
  order_received: { subject: 'Order #{{order_id}} received — thank you!', message: "Thanks for your order! We've received it and our team is reviewing it now. You'll receive another email as soon as your order is confirmed." },
  order_confirmed: { subject: 'Order #{{order_id}} confirmed ✓', message: 'Great news! Your order has been confirmed and our team is now preparing it for dispatch.' },
  order_packed: { subject: 'Order #{{order_id}} is packed and ready', message: 'Your order has been carefully packed and will be handed to the courier very soon.' },
  order_shipped: { subject: 'Order #{{order_id}} is on its way! 🚚', message: 'Your order has shipped and is on its way to you via our courier partner.' },
  order_out_for_delivery: { subject: 'Order #{{order_id}} is out for delivery today!', message: 'Your order is out for delivery and should arrive at your door today. Please make sure someone is available to receive it.' },
  order_delivered: { subject: 'Order #{{order_id}} delivered — enjoy! 🎉', message: 'Your order has been delivered. We hope you love your purchase! If you have any questions or concerns, feel free to reach out.' },
  order_cancelled: { subject: 'Order #{{order_id}} has been cancelled', message: 'Your order has been cancelled. If you did not request this cancellation or have any questions, please contact us immediately.' },
  order_returned: { subject: 'Order #{{order_id}} return processed', message: 'Your return for order #{{order_id}} has been processed. If you have questions about your refund or exchange, please contact us.' },
  review_reminder: { subject: 'How was your order #{{order_id}}? Share your review ⭐', message: "It's been 2 weeks since your order was delivered. We hope you're enjoying your purchase! Your honest review helps other customers make the right choice. It only takes a minute:" },
  password_reset: { subject: 'Reset your password', message: 'We received a request to reset your password. Click the button below to choose a new one. If you did not request this, you can safely ignore this email — your password will not be changed.' },
  newsletter_welcome: { subject: "You're subscribed! 🎉", message: "Thanks for subscribing to our newsletter! You'll be the first to know about new arrivals, sales, and exclusive offers." },
}

const EMAIL_TYPES = [
  {
    key: 'signup',
    label: 'Welcome / Sign Up',
    description: 'Sent when a customer creates a new account. The email verification button is always included automatically.',
    placeholders: [{ tag: '{{name}}', desc: 'Customer name' }],
  },
  {
    key: 'order_received',
    label: 'Order Received',
    description: 'Sent immediately after an order is placed. Order details (number, total, payment, shipping address) are always included below.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'order_confirmed',
    label: 'Order Confirmed',
    description: 'Sent when you confirm an order. The full invoice (items, totals, shipping details) is automatically included below your message.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'order_packed',
    label: 'Order Packed',
    description: 'Sent when you mark the order as packed.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'order_shipped',
    label: 'Order Shipped',
    description: 'Sent when you mark the order as shipped. Tracking info is included automatically if a tracking number was entered.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
      { tag: '{{tracking_number}}', desc: 'Tracking number (if added)' },
      { tag: '{{courier}}', desc: 'Courier name (if added)' },
    ],
  },
  {
    key: 'order_out_for_delivery',
    label: 'Out for Delivery',
    description: 'Sent when the order is marked as out for delivery.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'order_delivered',
    label: 'Order Delivered',
    description: 'Sent when the order is marked as delivered.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'order_cancelled',
    label: 'Order Cancelled',
    description: 'Sent when an order is cancelled.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'order_returned',
    label: 'Order Returned',
    description: 'Sent when a return is processed.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'review_reminder',
    label: 'Review Reminder',
    description: 'Sent automatically 2 weeks after delivery. A list of purchased products with review links is always included below your message.',
    placeholders: [
      { tag: '{{name}}', desc: 'Customer name' },
      { tag: '{{order_id}}', desc: 'Order number' },
    ],
  },
  {
    key: 'password_reset',
    label: 'Password Reset',
    description: 'Sent when a customer requests a password reset. The reset button/link is always included automatically.',
    placeholders: [{ tag: '{{name}}', desc: 'Customer name' }],
  },
  {
    key: 'newsletter_welcome',
    label: 'Newsletter Welcome',
    description: 'Sent when someone subscribes to the newsletter for the first time.',
    placeholders: [],
  },
]

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState({})
  const [selected, setSelected] = useState('signup')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedKey, setSavedKey] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/content/email-templates')
      .then((data) => {
        // Deep-merge fetched data with TEMPLATE_DEFAULTS so all 10 types are
        // always present in state, even if the DB only stored a subset.
        const merged = {}
        Object.keys(TEMPLATE_DEFAULTS).forEach((key) => {
          merged[key] = {
            subject: data?.[key]?.subject || TEMPLATE_DEFAULTS[key].subject,
            message: data?.[key]?.message || TEMPLATE_DEFAULTS[key].message,
          }
        })
        setTemplates(merged)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (key) => {
    setSelected(key)
    setSavedKey(null)
    setError('')
  }

  const handleChange = (field, value) => {
    setTemplates((prev) => ({
      ...prev,
      [selected]: { ...(prev[selected] || {}), [field]: value },
    }))
    setSavedKey(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSavedKey(null)
    try {
      await api.put('/admin/content/email-templates', templates, { auth: true })
      setSavedKey(selected)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const typeInfo = EMAIL_TYPES.find((t) => t.key === selected)
  const current = templates[selected] || { subject: '', message: '' }

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Email Templates</h1>
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Customize the subject line and message body for each automatic email. Use placeholders like{' '}
        <code className="bg-cz-gold-light text-[#212121] px-1.5 py-0.5 rounded text-[12px] font-mono">{'{{name}}'}</code>{' '}
        to insert dynamic values. The email design and layout stay the same — only the text changes.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="text-[14px] text-[#4b4b4b]">Loading...</div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Left: type list */}
          <div className="w-[220px] shrink-0 bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
            {EMAIL_TYPES.map((type, idx) => (
              <button
                key={type.key}
                type="button"
                onClick={() => handleSelect(type.key)}
                className={`w-full text-left px-4 py-3 text-[13px] font-medium transition-colors ${
                  idx > 0 ? 'border-t border-[#f0f0f0]' : ''
                } ${
                  selected === type.key
                    ? 'bg-cz-primary text-white'
                    : 'text-[#212121] hover:bg-cz-gold-light'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Right: editor */}
          <div className="flex-1 bg-white rounded-[10px] border border-[#dedede] p-6">
            <h2 className="text-[17px] font-semibold text-[#212121] mb-1">{typeInfo.label}</h2>
            <p className="text-[13px] text-[#4b4b4b] mb-5">{typeInfo.description}</p>

            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-[#212121] mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={current.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                  placeholder="Email subject line..."
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#212121] mb-1.5">
                  Message Body
                </label>
                <textarea
                  rows={5}
                  value={current.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-y"
                  placeholder="Message text that appears at the top of the email..."
                />
                <p className="text-[12px] text-[#888] mt-1">
                  Plain text only — no HTML tags. The email design (colours, branding) is applied automatically.
                </p>
              </div>

              {/* Placeholders */}
              <div className="bg-cz-gold-light rounded-[8px] px-4 py-3">
                <p className="text-[12px] font-semibold text-[#212121] mb-2 uppercase tracking-wide">
                  Available Placeholders
                </p>
                <div className="flex flex-wrap gap-2">
                  {typeInfo.placeholders.map((p) => (
                    <div key={p.tag} className="flex items-center gap-1.5">
                      <code className="bg-white border border-[#d4af37] rounded px-2 py-0.5 text-[12px] font-mono text-[#102b53]">
                        {p.tag}
                      </code>
                      <span className="text-[12px] text-[#4b4b4b]">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#f0f0f0]">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
              {savedKey === selected && (
                <span className="text-[13px] text-green-600 font-medium">Saved!</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}