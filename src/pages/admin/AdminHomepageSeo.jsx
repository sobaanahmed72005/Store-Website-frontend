import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useSeo } from '../../hooks/useSeo'

const DEFAULT_CONTENT = {
  title: "Pakistan's Premier IT Hardware & Technology Store",
  intro:
    "Welcome to IT Solutions — your authorized supplier of genuine IT equipment, office networking solutions, surveillance systems, and high-performance computing hardware in Pakistan. Whether you are setting up home security or equipping a modern corporate office, we offer competitive pricing, official brand warranty, and fast nationwide Cash on Delivery.",
  columns: [
    {
      heading: 'Laptops & Computing',
      description:
        'Explore Apple MacBook, Dell XPS, HP ProBook, Lenovo ThinkPad, and ASUS ROG gaming laptops with official international warranty and authentic power adapters.',
    },
    {
      heading: '4K Security & Surveillance',
      description:
        'Secure your home and business with Hikvision, EZVIZ, and IMOU 4K security cameras, wireless PTZ dome cameras, NVR recording units, and smart night-vision sensors.',
    },
    {
      heading: 'Networking & Solar Energy',
      description:
        'Upgrade your connectivity with Wi-Fi 6 Gigabit routers, enterprise switches, and hybrid solar inverters for continuous uninterrupted power supply.',
    },
  ],
}

export default function AdminHomepageSeo() {
  useSeo({ title: 'Admin - Homepage SEO Content', noindex: true })

  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .get(ENDPOINTS.CONTENT.HOMEPAGE_SEO)
      .then((data) => {
        if (!data || typeof data !== 'object') return
        setContent({
          title: data.title || DEFAULT_CONTENT.title,
          intro: data.intro || DEFAULT_CONTENT.intro,
          columns: Array.isArray(data.columns) && data.columns.length === 3 ? data.columns : DEFAULT_CONTENT.columns,
        })
      })
      .catch((err) => console.error('Failed to load homepage SEO content:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleColumnChange = (index, field, value) => {
    setContent((prev) => {
      const nextCols = [...prev.columns]
      nextCols[index] = { ...nextCols[index], [field]: value }
      return { ...prev, columns: nextCols }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await api.put(ENDPOINTS.ADMIN.CONTENT.HOMEPAGE_SEO, content, { auth: true })
      setMessage('Homepage SEO content updated successfully!')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      alert('Failed to save changes: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-slate-500 text-sm">
        Loading Homepage SEO Settings...
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage SEO Content Manager</h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize the keyword-rich summary block displayed right above the homepage footer.
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Section Heading & Intro */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800">Main Heading & Overview</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/20 focus:border-[#0c4a6e]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Intro Description Paragraph</label>
            <textarea
              rows={3}
              value={content.intro}
              onChange={(e) => setContent((prev) => ({ ...prev, intro: e.target.value }))}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/20 focus:border-[#0c4a6e]"
              required
            />
          </div>
        </div>

        {/* 3 Columns Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800">3-Column Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.columns.map((col, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Column {idx + 1}</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Heading</label>
                  <input
                    type="text"
                    value={col.heading}
                    onChange={(e) => handleColumnChange(idx, 'heading', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/20 focus:border-[#0c4a6e]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={col.description}
                    onChange={(e) => handleColumnChange(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/20 focus:border-[#0c4a6e]"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0c4a6e] hover:bg-[#0369a1] rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Live Preview */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Live Homepage Footer Preview</h2>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-[20px] font-bold text-[#0c4a6e] font-heading tracking-tight mb-3">
            {content.title}
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-6">
            {content.intro}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-[13px] text-slate-600">
            {content.columns.map((col, i) => (
              <div key={i}>
                <h3 className="font-bold text-[#0c4a6e] text-[15px] font-heading mb-1.5">
                  {col.heading}
                </h3>
                <p className="leading-relaxed">{col.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
