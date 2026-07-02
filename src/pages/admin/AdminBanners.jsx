import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const EMPTY_SLIDE = { image: '', tagline: '', title: '', description: '', cta: '', href: '', active: true }
const EMPTY_SIDE = { image: '', tagline: '', title: '', description: '', cta: '', href: '', active: true }

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[12px] text-[#4b4b4b] mb-1">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary"
    />
  )
}

function ImagePreview({ src }) {
  const [broken, setBroken] = useState(false)
  useEffect(() => { setBroken(false) }, [src])
  if (!src || broken) return null
  return (
    <img
      src={src}
      alt="preview"
      className="mt-2 h-20 w-full object-cover rounded-md border border-[#e5e7eb]"
      onError={() => setBroken(true)}
    />
  )
}

export default function AdminBanners() {
  const [slides, setSlides] = useState([])
  const [sideBanners, setSideBanners] = useState([{ ...EMPTY_SIDE }, { ...EMPTY_SIDE }])
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_SLIDE })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get('/content/hero-banners')
      .then((data) => {
        setSlides(data.slides || [])
        if (data.sideBanners?.length >= 2) setSideBanners(data.sideBanners)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openEdit(idx) {
    setEditIdx(idx)
    setForm(idx === 'new' ? { ...EMPTY_SLIDE } : { ...slides[idx] })
    setError('')
  }

  function cancelEdit() {
    setEditIdx(null)
    setForm({ ...EMPTY_SLIDE })
    setError('')
  }

  function saveSlide() {
    if (!form.image.trim()) {
      setError('Image URL is required for a slide.')
      return
    }
    const updated = [...slides]
    if (editIdx === 'new') {
      updated.push({ ...form })
    } else {
      updated[editIdx] = { ...form }
    }
    setSlides(updated)
    setEditIdx(null)
    setForm({ ...EMPTY_SLIDE })
    setError('')
  }

  function deleteSlide(idx) {
    setSlides((prev) => prev.filter((_, i) => i !== idx))
    if (editIdx === idx) cancelEdit()
  }

  function moveSlide(idx, dir) {
    const to = idx + dir
    if (to < 0 || to >= slides.length) return
    const updated = [...slides]
    ;[updated[idx], updated[to]] = [updated[to], updated[idx]]
    setSlides(updated)
  }

  function updateSide(idx, field, value) {
    setSideBanners((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/admin/content/hero-banners', { slides, sideBanners }, { auth: true })
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
    <div className="p-8 max-w-[760px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Hero Banners</h1>
      <p className="text-[14px] text-[#6b7280] mb-6">
        Control the slider and side banners at the top of the home page. Use public image URLs from
        Imgur, Google Drive (set to "Anyone with link"), or Cloudinary.
      </p>

      {error && <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2 mb-4">{error}</div>}
      {saved && <div className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2 mb-4">Saved successfully.</div>}

      {/* ── MAIN SLIDER ── */}
      <div className="bg-white rounded-[10px] border border-[#dedede] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#212121]">Main Slider</h2>
            <p className="text-[12px] text-[#9ca3af]">Large rotating banner on the left. Slides cycle every 5 seconds.</p>
          </div>
          <button
            type="button"
            onClick={() => openEdit('new')}
            className="shrink-0 text-[13px] font-medium text-white bg-cz-primary hover:bg-cz-primary-hover px-4 py-2 rounded-md transition-colors"
          >
            + Add Slide
          </button>
        </div>

        {slides.length === 0 && editIdx !== 'new' && (
          <p className="text-[13px] text-[#9ca3af] py-3 text-center border border-dashed border-[#e5e7eb] rounded-lg">
            No slides added yet — the home page will show the default images until you add your own.
          </p>
        )}

        <div className="flex flex-col gap-2 mb-4">
          {slides.map((slide, i) => (
            <div key={i} className="flex items-center gap-3 border border-[#e5e7eb] rounded-lg p-3 bg-[#fafafa]">
              {slide.image ? (
                <img
                  src={slide.image}
                  alt=""
                  className="w-16 h-10 object-cover rounded shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-16 h-10 bg-[#f3f4f6] rounded shrink-0 flex items-center justify-center text-[10px] text-[#9ca3af]">
                  No img
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#212121] truncate">{slide.title || '(No title)'}</p>
                {slide.tagline && <p className="text-[11px] text-[#9ca3af] truncate">{slide.tagline}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${slide.active !== false ? 'bg-green-100 text-green-700' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
                  {slide.active !== false ? 'Active' : 'Hidden'}
                </span>
                <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} title="Move up"
                  className="text-[14px] text-[#6b7280] hover:text-[#212121] disabled:opacity-25 w-6 text-center">↑</button>
                <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} title="Move down"
                  className="text-[14px] text-[#6b7280] hover:text-[#212121] disabled:opacity-25 w-6 text-center">↓</button>
                <button type="button" onClick={() => openEdit(i)}
                  className="text-[12px] font-medium text-cz-primary hover:underline">Edit</button>
                <button type="button" onClick={() => deleteSlide(i)}
                  className="text-[12px] font-medium text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Slide form */}
        {editIdx !== null && (
          <div className="border border-[#e5e7eb] rounded-lg p-4 bg-[#f9fafb]">
            <h3 className="text-[13px] font-semibold text-[#212121] mb-4">
              {editIdx === 'new' ? 'Add New Slide' : `Edit Slide ${editIdx + 1}`}
            </h3>
            <div className="flex flex-col gap-3">
              <Field label="Image URL *" hint="Paste a direct image link. The image should be at least 1200×660 px for best quality.">
                <TextInput
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://i.imgur.com/yourimage.jpg"
                />
                <ImagePreview src={form.image} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Tagline (small text above title)">
                  <TextInput value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                    placeholder="e.g. Power Meets Performance" />
                </Field>
                <Field label="Title (large heading)">
                  <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Latest Laptops" />
                </Field>
              </div>

              <Field label="Description">
                <TextInput value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short line under the title" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Button Text">
                  <TextInput value={form.cta} onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                    placeholder="Shop Now" />
                </Field>
                <Field label="Button Link" hint="Use /shop, /products, or a full URL">
                  <TextInput value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                    placeholder="/shop" />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-[#4b4b4b] cursor-pointer">
                <input type="checkbox" checked={form.active !== false}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded" />
                Active (show on site)
              </label>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={saveSlide}
                  className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-medium px-5 py-2 transition-colors">
                  {editIdx === 'new' ? 'Add Slide' : 'Update Slide'}
                </button>
                <button type="button" onClick={cancelEdit}
                  className="rounded-md border border-[#d1d5db] text-[13px] text-[#4b4b4b] px-5 py-2 hover:bg-[#f3f4f6] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SIDE BANNERS ── */}
      <div className="bg-white rounded-[10px] border border-[#dedede] p-6 mb-6">
        <h2 className="text-[15px] font-semibold text-[#212121] mb-1">Side Banners</h2>
        <p className="text-[12px] text-[#9ca3af] mb-5">
          Two stacked panels on the right side of the hero. Leave Title empty for a minimal layout (just button at the bottom).
        </p>

        <div className="flex flex-col gap-6">
          {sideBanners.map((banner, i) => (
            <div key={i} className="border border-[#e5e7eb] rounded-lg p-4">
              <p className="text-[13px] font-semibold text-[#4b4b4b] mb-3">Banner {i + 1}</p>
              <div className="flex flex-col gap-3">
                <Field label="Image URL" hint="Recommended size: 600×360 px.">
                  <TextInput type="url" value={banner.image || ''}
                    onChange={(e) => updateSide(i, 'image', e.target.value)}
                    placeholder="https://i.imgur.com/yourimage.jpg" />
                  <ImagePreview src={banner.image} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Tagline">
                    <TextInput value={banner.tagline || ''} onChange={(e) => updateSide(i, 'tagline', e.target.value)}
                      placeholder="e.g. Tested. Trusted." />
                  </Field>
                  <Field label="Title">
                    <TextInput value={banner.title || ''} onChange={(e) => updateSide(i, 'title', e.target.value)}
                      placeholder="e.g. Used Laptops" />
                  </Field>
                </div>

                <Field label="Description">
                  <TextInput value={banner.description || ''} onChange={(e) => updateSide(i, 'description', e.target.value)}
                    placeholder="Short line" />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Button Text">
                    <TextInput value={banner.cta || ''} onChange={(e) => updateSide(i, 'cta', e.target.value)}
                      placeholder="See Offers" />
                  </Field>
                  <Field label="Button Link">
                    <TextInput value={banner.href || ''} onChange={(e) => updateSide(i, 'href', e.target.value)}
                      placeholder="/shop" />
                  </Field>
                </div>

                <label className="flex items-center gap-2 text-[13px] text-[#4b4b4b] cursor-pointer">
                  <input type="checkbox" checked={banner.active !== false}
                    onChange={(e) => updateSide(i, 'active', e.target.checked)}
                    className="rounded" />
                  Active (show on site)
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-2.5 transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
    </div>
  )
}