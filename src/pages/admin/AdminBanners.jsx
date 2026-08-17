import { useCallback, useEffect, useState } from 'react'
import { api, resolveImageUrl, uploadImage } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useAdminForm } from '../../hooks/useAdminForm'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

const EMPTY_SLIDE = { image: '', href: '/shop', cta: '', active: true }

function withKeys(items) {
  return (items || []).map((item) => ({ ...item, _key: item._key || crypto.randomUUID() }))
}

function stripKeys(items) {
  return items.map(({ _key, ...rest }) => rest)
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#374151] mb-1">{label}</label>
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
      src={resolveImageUrl(src)}
      alt="preview"
      width={600}
      height={120}
      className="mt-2 h-28 w-full object-cover rounded-md border border-[#e5e7eb]"
      onError={() => setBroken(true)}
    />
  )
}

export default function AdminBanners() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Hero Banners — Manage Your Store | ${siteName || 'IT Solutions'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  const [slides, setSlides] = useState([])
  const [editIdx, setEditIdx] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_SLIDE })

  const load = useCallback(
    () =>
      api.get(ENDPOINTS.CONTENT.HERO_BANNERS).then((data) => {
        // Combine any existing slides & sideBanners into a single list
        const mainSlides = data.slides || []
        const sideBanners = data.sideBanners || []
        setSlides(withKeys([...mainSlides, ...sideBanners]))
      }),
    []
  )

  const { loading, saving, saved, setSaved, error, setError, save } = useAdminForm(load)
  const [uploadingSlideImg, setUploadingSlideImg] = useState(false)

  async function handleSlideFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingSlideImg(true)
      setError('')
      const { url } = await uploadImage(file)
      setForm((f) => ({ ...f, image: url }))
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploadingSlideImg(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 3000)
    return () => clearTimeout(timer)
  }, [saved, setSaved])

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
      setError('Image URL or file upload is required.')
      return
    }
    const updated = [...slides]
    if (editIdx === 'new') {
      updated.push({ ...form, _key: crypto.randomUUID() })
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

  function handleSave() {
    save(() =>
      api.put(
        ENDPOINTS.ADMIN.CONTENT.HERO_BANNERS,
        { slides: stripKeys(slides), sideBanners: [] },
        { auth: true }
      )
    )
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[760px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Hero Banners</h1>
      <SeoHeadingFiller h4="Slide editor" h5="Banner list" h6="Save action" />
      <p className="text-[14px] text-[#6b7280] mb-6">
        Manage full-width Hero Banners for your home page. Upload poster images with graphics/text designed into the poster image. The entire poster is clickable!
      </p>

      {error && <div className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2 mb-4">{error}</div>}
      {saved && <div className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-2 mb-4">Saved successfully.</div>}

      {/* ── HERO BANNERS LIST ── */}
      <div className="bg-white rounded-[10px] border border-[#dedede] p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#212121]">Hero Banners Carousel</h2>
            <p className="text-[12px] text-[#9ca3af]">Add as many hero banners as you want. They cycle automatically and support left/right arrows.</p>
          </div>
          <button
            type="button"
            onClick={() => openEdit('new')}
            className="shrink-0 text-[13px] font-medium text-white bg-cz-primary hover:bg-cz-primary-hover px-4 py-2 rounded-md transition-colors"
          >
            + Add Hero Banner
          </button>
        </div>

        {slides.length === 0 && editIdx !== 'new' && (
          <p className="text-[13px] text-[#9ca3af] py-6 text-center border border-dashed border-[#e5e7eb] rounded-lg">
            No hero banners added yet — click "+ Add Hero Banner" to add your first poster banner.
          </p>
        )}

        <div className="flex flex-col gap-2.5 mb-4">
          {slides.map((slide, i) => (
            <div key={slide._key} className="flex items-center gap-3 border border-[#e5e7eb] rounded-lg p-3 bg-[#fafafa]">
              {slide.image ? (
                <img
                  src={resolveImageUrl(slide.image)}
                  alt=""
                  width={80}
                  height={45}
                  className="w-20 h-11 object-cover rounded shrink-0 border border-[#e5e7eb]"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-20 h-11 bg-[#f3f4f6] rounded shrink-0 flex items-center justify-center text-[10px] text-[#9ca3af]">
                  No image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#212121] truncate">Banner #{i + 1}</p>
                <p className="text-[11px] text-[#6b7280] truncate">Target Link: <span className="font-mono text-[#0ea5e9]">{slide.href || '/shop'}</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${slide.active !== false ? 'bg-green-100 text-green-700' : 'bg-[#f3f4f6] text-[#9ca3af]'}`}>
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

        {/* Banner form */}
        {editIdx !== null && (
          <div className="border border-[#e5e7eb] rounded-lg p-5 bg-[#f9fafb] mt-4">
            <h3 className="text-[14px] font-semibold text-[#212121] mb-4">
              {editIdx === 'new' ? 'Add New Hero Banner' : `Edit Hero Banner #${editIdx + 1}`}
            </h3>
            <div className="flex flex-col gap-4">
              <Field label="Banner Poster Image *" hint="Upload a poster image file from your device, or paste an image URL / Google Drive link. (Recommended: 1200×500 px or 16:9 widescreen)">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <TextInput
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      placeholder="Paste image URL or click Upload File"
                    />
                  </div>
                  <label className={`cursor-pointer border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] text-[#374151] text-[13px] font-medium px-4 py-2 rounded-md shrink-0 flex items-center gap-1.5 transition-colors ${uploadingSlideImg ? 'opacity-50 cursor-wait' : ''}`}>
                    <span>{uploadingSlideImg ? 'Uploading...' : 'Upload File'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSlideFileUpload} disabled={uploadingSlideImg} />
                  </label>
                </div>
                <ImagePreview src={form.image} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Destination Link" hint="Where clicking this poster takes the customer (e.g. /shop, /products, /cctv)">
                  <TextInput value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                    placeholder="/shop" />
                </Field>
                <Field label="Optional Button Label" hint="Leave blank if button is already designed inside your poster image">
                  <TextInput value={form.cta} onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                    placeholder="Optional (e.g. Shop CCTV)" />
                </Field>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-[#4b4b4b] cursor-pointer">
                <input type="checkbox" checked={form.active !== false}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded" />
                Active (show on site)
              </label>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={saveSlide}
                  className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-medium px-5 py-2 transition-colors">
                  {editIdx === 'new' ? 'Add Hero Banner' : 'Update Hero Banner'}
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