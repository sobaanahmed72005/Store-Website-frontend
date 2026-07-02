import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const emptyContent = {
  description: '',
  address: '',
  phone: '',
  email: '',
  hours: 'Mon–Thu and Sat: 11 AM – 8 PM | Fri: 11 AM – 1 PM, 2:30 PM – 8 PM | Sun: Closed',
  social: { facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '', tiktok: '' },
  columns: [
    {
      heading: 'Shop',
      links: [
        { label: 'All Products', href: '/products' },
        { label: 'Cart', href: '/cart' },
        { label: 'Track Order', href: '/account' },
      ],
    },
    {
      heading: 'Account',
      links: [
        { label: 'Sign Up', href: '/signup' },
        { label: 'Sign In', href: '/signin' },
        { label: 'My Account', href: '/account' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Return & Exchange', href: '/return-exchange' },
        { label: 'Privacy Policy', href: '/privacy-policy' },
      ],
    },
  ],
  marqueeMessages: [
    'Store Timings: Mon–Thu and Sat: 11 AM – 8 PM | Fri: 11 AM – 1 PM, 2:30 PM – 8 PM | Sun: Closed',
    'Prices may vary due to currency changes.',
    'We operate only one official store. Beware of fake stores claiming our name.',
  ],
}

const SOCIAL_FIELDS = [
  { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
  { key: 'twitter', label: 'Twitter / X URL', placeholder: 'https://x.com/yourhandle' },
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourhandle' },
  { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/yourchannel' },
  { key: 'whatsapp', label: 'WhatsApp Number (with country code)', placeholder: '923001234567', hint: 'Digits only — no +, spaces, or dashes. Customers will open a direct chat with this number.' },
  { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourhandle' },
]

export default function AdminFooter() {
  const [content, setContent] = useState(emptyContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get('/content/footer-brand')
      .then((data) =>
        setContent({
          description: data.description ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          hours: data.hours ?? emptyContent.hours,
          social: { ...emptyContent.social, ...data.social },
          columns: data.columns?.length ? data.columns : emptyContent.columns,
          marqueeMessages: data.marqueeMessages?.length ? data.marqueeMessages : emptyContent.marqueeMessages,
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const updateField = (field, value) => setContent((prev) => ({ ...prev, [field]: value }))
  const updateSocial = (key, value) =>
    setContent((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }))

  const updateColumnHeading = (colIndex, heading) =>
    setContent((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === colIndex ? { ...col, heading } : col)),
    }))

  const updateColumnLink = (colIndex, linkIndex, field, value) =>
    setContent((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === colIndex
          ? { ...col, links: col.links.map((link, j) => (j === linkIndex ? { ...link, [field]: value } : link)) }
          : col
      ),
    }))

  const addColumnLink = (colIndex) =>
    setContent((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) => (i === colIndex ? { ...col, links: [...col.links, { label: '', href: '' }] } : col)),
    }))

  const removeColumnLink = (colIndex, linkIndex) =>
    setContent((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === colIndex ? { ...col, links: col.links.filter((_, j) => j !== linkIndex) } : col
      ),
    }))

  const updateMessage = (index, value) =>
    setContent((prev) => ({ ...prev, marqueeMessages: prev.marqueeMessages.map((m, i) => (i === index ? value : m)) }))

  const addMessage = () => setContent((prev) => ({ ...prev, marqueeMessages: [...prev.marqueeMessages, ''] }))

  const removeMessage = (index) =>
    setContent((prev) => ({ ...prev, marqueeMessages: prev.marqueeMessages.filter((_, i) => i !== index) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/admin/content/footer-brand', content, { auth: true })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[900px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Footer / Store Info</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved. Refresh any page to see the footer update.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
          <h2 className="text-[16px] font-semibold text-[#212121]">Brand</h2>
          <p className="text-[12px] text-[#9ca3af] -mt-2">
            The store name itself is set under Admin → Profile.
          </p>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Description</label>
            <textarea
              value={content.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
          <h2 className="text-[16px] font-semibold text-[#212121]">Contact Details</h2>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Address</label>
            <input
              value={content.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Phone Number(s)</label>
            <input
              value={content.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+92xxxxxxxxxx | +92xxxxxxxxxx"
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
            <p className="text-[12px] text-[#9ca3af] mt-1">Separate multiple numbers with a pipe ( | ). The first one is used for the click-to-call link.</p>
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Email</label>
            <input
              value={content.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Store Hours</label>
            <input
              value={content.hours}
              onChange={(e) => updateField('hours', e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
            <p className="text-[12px] text-[#9ca3af] mt-1">Shown on the Contact page and can be referenced in your announcement bar messages below.</p>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
          <h2 className="text-[16px] font-semibold text-[#212121]">Social Media</h2>
          <p className="text-[12px] text-[#9ca3af] -mt-2">Leave a field blank to show that icon as disabled (no link).</p>
          {SOCIAL_FIELDS.map(({ key, label, placeholder, hint }) => (
            <div key={key}>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">{label}</label>
              <input
                value={content.social[key]}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
              {hint && <p className="text-[12px] text-[#9ca3af] mt-1">{hint}</p>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#212121]">Footer Links</h2>
            <p className="text-[12px] text-[#9ca3af] mt-1">
              Use an internal path (e.g. <code>/category/laptops</code>, <code>/products</code>) to link within your
              store, or a full https:// URL to link elsewhere.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.columns.map((col, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-2 border border-[#eee] rounded-md p-3">
                <input
                  value={col.heading}
                  onChange={(e) => updateColumnHeading(colIndex, e.target.value)}
                  placeholder="Column heading"
                  className="rounded-md border border-[#d1d5db] text-[13px] font-medium px-2.5 py-2 outline-none focus:border-cz-primary"
                />
                {col.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex items-center gap-1.5">
                    <input
                      value={link.label}
                      onChange={(e) => updateColumnLink(colIndex, linkIndex, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-2/5 rounded-md border border-[#d1d5db] text-[13px] px-2 py-1.5 outline-none focus:border-cz-primary"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateColumnLink(colIndex, linkIndex, 'href', e.target.value)}
                      placeholder="/path or https://..."
                      className="flex-1 rounded-md border border-[#d1d5db] text-[13px] px-2 py-1.5 outline-none focus:border-cz-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeColumnLink(colIndex, linkIndex)}
                      className="text-red-600 text-[13px] px-1"
                      aria-label="Remove link"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addColumnLink(colIndex)} className="text-[12px] text-cz-primary hover:underline self-start">
                  + Add link
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-3">
          <h2 className="text-[16px] font-semibold text-[#212121]">Announcement Bar Messages</h2>
          <p className="text-[12px] text-[#9ca3af] -mt-2">
            These rotate in the scrolling bar at the very top of every page (store timings, notices, etc.).
          </p>
          {content.marqueeMessages.map((message, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={message}
                onChange={(e) => updateMessage(index, e.target.value)}
                className="flex-1 rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
              <button type="button" onClick={() => removeMessage(index)} className="text-red-600 text-[13px] px-2" aria-label="Remove message">
                ×
              </button>
            </div>
          ))}
          <button type="button" onClick={addMessage} className="text-[13px] text-cz-primary hover:underline self-start">
            + Add message
          </button>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
