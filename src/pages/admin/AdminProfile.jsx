import { useState } from 'react'
import { api, uploadImage, resolveImageUrl } from '../../api/client'
import { useSiteSettings } from '../../context/SiteSettingsContext'
import { useAuth } from '../../context/AuthContext'

function BrandingSection() {
  const { siteName, setSiteName, logo, setLogo } = useSiteSettings()
  const [name, setName] = useState(siteName)
  const [logoValue, setLogoValue] = useState(logo)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await uploadImage(file)
      setLogoValue(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/admin/content/site-settings', { siteName: name, logo: logoValue }, { auth: true })
      setSiteName(name)
      setLogo(logoValue)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
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
        <p className="text-[12px] text-[#9ca3af] mt-1">Appears before the business name in the header and as the browser tab icon.</p>
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

function AccountSection() {
  const { user, updateSession } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
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
      updateSession(data.user, data.token)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-[#212121]">Account Details</h2>
      {error && <div className="text-[14px] text-red-600">{error}</div>}
      {saved && <div className="text-[14px] text-green-700">Saved.</div>}

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
        <p className="text-[12px] text-[#9ca3af] mt-1">This is also your login email for this admin panel.</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Account Details'}
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
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-[#212121]">Change Password</h2>
      {error && <div className="text-[14px] text-red-600">{error}</div>}
      {saved && <div className="text-[14px] text-green-700">Password updated.</div>}

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
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Change Password'}
        </button>
      </div>
    </form>
  )
}

export default function AdminProfile() {
  return (
    <div className="p-8 max-w-[640px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Profile</h1>
      <div className="flex flex-col gap-6">
        <BrandingSection />
        <AccountSection />
        <PasswordSection />
      </div>
    </div>
  )
}