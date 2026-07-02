import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const COLOR_PRESETS = [
  { label: 'Red (Sale)',   value: '#c62828' },
  { label: 'Navy',        value: '#102b53' },
  { label: 'Black',       value: '#111111' },
  { label: 'Green',       value: '#2e7d32' },
  { label: 'Gold',        value: '#b8932e' },
  { label: 'Purple',      value: '#6a1b9a' },
]

export default function AdminAnnouncement() {
  const [form, setForm] = useState({
    enabled: false,
    text: '',
    bgColor: '#c62828',
    textColor: '#ffffff',
    speed: 25,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/content/announcement-bar')
      .then((data) => setForm((f) => ({ ...f, ...data })))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/admin/content/announcement-bar', form, { auth: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[600px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Announcement Bar</h1>
      <p className="text-[14px] text-[#6b7280] mb-6">
        A scrolling strip that appears at the very top of the home page. Use it for mega sales,
        special events, or important notices.
      </p>

      {error && <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2 mb-4">{error}</div>}
      {saved && <div className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2 mb-4">Saved successfully.</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-5">

        {/* Enable toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-[#e5e7eb] bg-[#f9fafb]">
          <div>
            <p className="text-[14px] font-semibold text-[#212121]">
              {form.enabled ? '🟢 Bar is ON — visible on home page' : '⚫ Bar is OFF — hidden from customers'}
            </p>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">Toggle to show or hide the strip instantly after saving.</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              form.enabled ? 'bg-green-500' : 'bg-[#d1d5db]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                form.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Message text */}
        <div>
          <label className="block text-[13px] font-medium text-[#4b4b4b] mb-1">Announcement Message</label>
          <textarea
            rows={3}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="e.g. 🎉 MEGA SALE — Up to 50% off! Free delivery on orders above Rs. 5000."
            className="w-full rounded-md border border-[#d1d5db] text-[13px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
          />
          <p className="text-[11px] text-[#9ca3af] mt-1">The text will scroll across the strip repeatedly. Emojis work great here.</p>
        </div>

        {/* Background color */}
        <div>
          <label className="block text-[13px] font-medium text-[#4b4b4b] mb-2">Background Color</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, bgColor: c.value }))}
                title={c.label}
                className={`h-8 px-3 rounded-md text-white text-[12px] font-medium border-2 transition-all ${
                  form.bgColor === c.value ? 'border-[#212121] scale-105' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.value }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[12px] text-[#6b7280]">Custom colour:</label>
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
              className="h-8 w-12 rounded cursor-pointer border border-[#d1d5db]"
            />
            <span className="text-[12px] text-[#9ca3af] font-mono">{form.bgColor}</span>
          </div>
        </div>

        {/* Text color */}
        <div>
          <label className="block text-[13px] font-medium text-[#4b4b4b] mb-2">Text Color</label>
          <div className="flex gap-3">
            {[{ label: 'White', value: '#ffffff' }, { label: 'Black', value: '#111111' }].map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, textColor: c.value }))}
                className={`px-4 py-1.5 rounded-md text-[13px] border-2 transition-all ${
                  form.textColor === c.value
                    ? 'border-cz-primary font-semibold'
                    : 'border-[#e5e7eb] text-[#4b4b4b]'
                }`}
                style={{ backgroundColor: c.value, color: c.value === '#ffffff' ? '#111' : '#fff' }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll speed */}
        <div>
          <label className="block text-[13px] font-medium text-[#4b4b4b] mb-2">
            Scroll Speed — <span className="font-normal text-[#9ca3af]">{form.speed}s</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#9ca3af]">Fast</span>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={form.speed}
              onChange={(e) => setForm((f) => ({ ...f, speed: Number(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-[11px] text-[#9ca3af]">Slow</span>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <label className="block text-[13px] font-medium text-[#4b4b4b] mb-2">Preview</label>
          <div
            className="w-full overflow-hidden rounded-md py-2"
            style={{ backgroundColor: form.bgColor }}
          >
            <style>{`
              @keyframes preview-scroll {
                0%   { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
            <span
              style={{
                color: form.textColor,
                animation: `preview-scroll ${form.speed}s linear infinite`,
              }}
              className="inline-block whitespace-nowrap text-[13px] font-semibold tracking-wide"
            >
              {form.text || 'Your announcement will appear here…'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="self-start rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}