import { useEffect, useState } from 'react'
import { api } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'

export default function TwoFactorSection() {
  const [status, setStatus] = useState(null)
  const [statusError, setStatusError] = useState('')
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
    // A failed status check must not be treated as "2FA is off" — that would tell an admin their
    // account is unprotected when it might not be. Surface the failure instead of guessing.
    api.get(ENDPOINTS.AUTH.TWO_FA_STATUS).then((data) => setStatus(data.enabled)).catch((err) => setStatusError(err.message))
  }, [])

  const startSetup = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await api.post(ENDPOINTS.AUTH.TWO_FA_SETUP, { password: setupPassword })
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
      const data = await api.post(ENDPOINTS.AUTH.TWO_FA_CONFIRM, { token: confirmToken })
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
      await api.post(ENDPOINTS.AUTH.TWO_FA_DISABLE, disableForm)
      setStatus(false)
      setDisabling(false)
      setDisableForm({ password: '', token: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (status === null) {
    if (!statusError) return null
    return (
      <div className="bg-white rounded-[10px] border border-[#dedede] p-6">
        <h2 className="text-[16px] font-semibold text-[#212121] mb-2">Two-Factor Authentication</h2>
        <div className="text-[14px] text-red-600">Couldn't load two-factor status: {statusError}</div>
      </div>
    )
  }

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
