import { useEffect, useState } from 'react'
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
      updateSession(data.user)
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

function TwoFactorSection() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')

  const [setupData, setSetupData] = useState(null)
  const [confirmToken, setConfirmToken] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState(null)
  const [busy, setBusy] = useState(false)

  const [enabling, setEnabling] = useState(false)
  const [setupPassword, setSetupPassword] = useState('')

  const [disabling, setDisabling] = useState(false)
  const [disableForm, setDisableForm] = useState({ password: '', token: '' })

  useEffect(() => {
    api.get('/auth/2fa/status').then((data) => setStatus(data.enabled)).catch(() => setStatus(false))
  }, [])

  const startSetup = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api.post('/auth/2fa/setup', { password: setupPassword })
      setSetupData(data)
      setEnabling(false)
      setSetupPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const confirmSetup = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api.post('/auth/2fa/confirm', { token: confirmToken })
      setRecoveryCodes(data.recoveryCodes)
      setStatus(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const finishSetup = () => {
    setSetupData(null)
    setConfirmToken('')
    setRecoveryCodes(null)
  }

  const handleDisableChange = (e) => {
    const { name, value } = e.target
    setDisableForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitDisable = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/auth/2fa/disable', disableForm)
      setStatus(false)
      setDisabling(false)
      setDisableForm({ password: '', token: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (status === null) return null

  return (
    <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-[#212121]">Two-Factor Authentication</h2>
      {error && <div className="text-[14px] text-red-600">{error}</div>}

      {recoveryCodes ? (
        <div>
          <p className="text-[14px] text-green-700 mb-2">Two-factor authentication is enabled.</p>
          <p className="text-[13px] text-[#4b4b4b] mb-2">
            Save these recovery codes somewhere safe. Each one can be used once to sign in if you lose access to your authenticator app. They won&apos;t be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 bg-[#f9fafb] border border-[#dedede] rounded-md p-3 font-mono text-[13px] mb-3">
            {recoveryCodes.map((code) => (
              <div key={code}>{code}</div>
            ))}
          </div>
          <button
            type="button"
            onClick={finishSetup}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors"
          >
            I&apos;ve saved these codes
          </button>
        </div>
      ) : setupData ? (
        <form onSubmit={confirmSetup} className="flex flex-col gap-3">
          <p className="text-[13px] text-[#4b4b4b]">
            Scan this QR code with an authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code it shows.
          </p>
          <img src={setupData.qrCodeDataUrl} alt="Two-factor QR code" className="w-[180px] h-[180px] border border-[#dedede] rounded-md" />
          <p className="text-[12px] text-[#9ca3af]">
            Can&apos;t scan? Enter this key manually: <span className="font-mono">{setupData.manualEntryKey}</span>
          </p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={confirmToken}
            onChange={(e) => setConfirmToken(e.target.value)}
            required
            className="w-full max-w-[200px] rounded-md border border-[#d1d5db] text-[14px] text-center tracking-[4px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
            >
              {busy ? 'Verifying...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={finishSetup}
              className="rounded-md border border-[#d1d5db] text-[#4b4b4b] text-[14px] font-medium px-6 py-2.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : status ? (
        disabling ? (
          <form onSubmit={submitDisable} className="flex flex-col gap-3 max-w-[320px]">
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Current Password</label>
              <input
                type="password"
                name="password"
                value={disableForm.password}
                onChange={handleDisableChange}
                required
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Authenticator or recovery code</label>
              <input
                type="text"
                name="token"
                value={disableForm.token}
                onChange={handleDisableChange}
                required
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-red-600 hover:bg-red-700 text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
              >
                {busy ? 'Disabling...' : 'Disable 2FA'}
              </button>
              <button
                type="button"
                onClick={() => setDisabling(false)}
                className="rounded-md border border-[#d1d5db] text-[#4b4b4b] text-[14px] font-medium px-6 py-2.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-[14px] text-green-700 mb-3">Two-factor authentication is enabled on your account.</p>
            <button
              type="button"
              onClick={() => setDisabling(true)}
              className="rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-[14px] font-medium px-6 py-2.5 transition-colors"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        )
      ) : enabling ? (
        <form onSubmit={startSetup} className="flex flex-col gap-3 max-w-[320px]">
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Confirm your password to continue</label>
          <input
            type="password"
            value={setupPassword}
            onChange={(e) => setSetupPassword(e.target.value)}
            required
            autoFocus
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
            >
              {busy ? 'Starting...' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setEnabling(false); setSetupPassword('') }}
              className="rounded-md border border-[#d1d5db] text-[#4b4b4b] text-[14px] font-medium px-6 py-2.5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p className="text-[13px] text-[#4b4b4b] mb-3">
            Add an extra layer of security to your admin account with an authenticator app.
          </p>
          <button
            type="button"
            onClick={() => setEnabling(true)}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors"
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      )}
    </div>
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
        <TwoFactorSection />
      </div>
    </div>
  )
}