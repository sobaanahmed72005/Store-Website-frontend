import { useState } from 'react'
import { api, uploadImage, resolveImageUrl } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import { useSiteSettings } from '../../../store/siteSettingsStore'
import { useAdminSave } from '../../../hooks/useAdminForm'

export default function BrandingSection() {
  const { siteName, setSiteName, logo, setLogo, favicon, setFavicon } = useSiteSettings()
  const [name, setName] = useState(siteName)
  const [logoValue, setLogoValue] = useState(logo)
  const [faviconValue, setFaviconValue] = useState(favicon)
  const [uploading, setUploading] = useState(false)

  const { saving, saved, error, setError, save } = useAdminSave()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url, faviconUrl } = await uploadImage(file, undefined, { purpose: 'logo' })
      setLogoValue(url)
      setFaviconValue(faviconUrl || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFaviconFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await uploadImage(file, undefined, { purpose: 'favicon' })
      setFaviconValue(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    save(async () => {
      await api.put(
        ENDPOINTS.ADMIN.CONTENT.SITE_SETTINGS,
        { siteName: name, logo: logoValue, favicon: faviconValue },
        { auth: true },
      )
      setSiteName(name)
      setLogo(logoValue)
      setFavicon(faviconValue)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-[#212121]">Store Branding</h2>
      {error && <div className="text-[14px] text-red-600">{error}</div>}
      {saved && <div className="text-[14px] text-green-700">Saved.</div>}

      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Logo</label>
        <div className="flex items-center gap-4">
          {logoValue && (
            <img src={resolveImageUrl(logoValue)} alt="Logo preview" className="h-10 w-auto object-contain rounded-md border border-[#dedede] p-1" />
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-[13px]" />
        </div>
        {uploading && <div className="text-[13px] text-[#4b4b4b] mt-1">Uploading...</div>}
        <p className="text-[12px] text-[#9ca3af] mt-1">Appears in the header, admin sidebar, and sign-in screen. We also try to auto-crop just the icon mark from it for the browser tab icon below.</p>
      </div>

      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Favicon (browser tab icon)</label>
        <div className="flex items-center gap-4">
          {faviconValue && (
            <img src={resolveImageUrl(faviconValue)} alt="Favicon preview" className="h-10 w-10 object-contain rounded-md border border-[#dedede] p-1" />
          )}
          <input type="file" accept="image/*" onChange={handleFaviconFileChange} className="text-[13px]" />
        </div>
        <p className="text-[12px] text-[#9ca3af] mt-1">
          Optional — only needed if the auto-cropped icon above doesn't look right (e.g. your logo has no clean gap between
          the icon and the text). Upload a small square icon here to use instead; otherwise the full logo is used as a fallback.
        </p>
      </div>

      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Business Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
        <p className="text-[12px] text-[#9ca3af] mt-1">Shown in the header, browser tab title, and footer across the whole site.</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </div>
    </form>
  )
}
