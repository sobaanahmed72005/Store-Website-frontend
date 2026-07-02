import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const emptyForm = {
  provider: 'Leopards Courier',
  enabled: false,
  tracking_url_template: 'https://leopardscourier.com/tracking/{tracking_number}',
  sandbox: true,
  default_weight_grams: 1000,
  origin_city: 'self',
  shipper_id: '',
  has_api_key: false,
  has_api_password: false,
}

export default function AdminCourier() {
  const [form, setForm] = useState(emptyForm)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiPasswordInput, setApiPasswordInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const loadSettings = () =>
    api
      .get('/admin/courier-settings', { auth: true })
      .then((data) => setForm({ ...emptyForm, ...data }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    loadSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    setTestResult(null)
    try {
      await api.put(
        '/admin/courier-settings',
        { ...form, api_key: apiKeyInput || undefined, api_password: apiPasswordInput || undefined },
        { auth: true }
      )
      setSaved(true)
      setApiKeyInput('')
      setApiPasswordInput('')
      await loadSettings()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setError('')
    setTestResult(null)
    try {
      const result = await api.post('/admin/courier-settings/test', {}, { auth: true })
      setTestResult(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  const isLeopards = /leopards/i.test(form.provider || '')

  return (
    <div className="p-8 max-w-[560px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Courier</h1>
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Once enabled, orders are auto-booked with Leopards the moment you mark them Shipped, and this store checks
        Leopards for live status updates every 30 minutes — advancing order status automatically as your package moves.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved.</div>}
      {testResult && <div className="text-[14px] text-green-700 mb-4">{testResult}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Courier</label>
          <input
            name="provider"
            value={form.provider}
            onChange={handleChange}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>

        <label className="flex items-center gap-2 text-[14px] text-[#212121]">
          <input type="checkbox" name="enabled" checked={form.enabled} onChange={handleChange} />
          Enable automated booking + live tracking sync
        </label>

        <label className={`flex items-center gap-2 text-[13px] rounded-md px-3 py-2.5 border ${form.sandbox ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-red-300 bg-red-50 text-red-800'}`}>
          <input type="checkbox" name="sandbox" checked={form.sandbox} onChange={handleChange} />
          Sandbox / staging mode {form.sandbox ? '(safe — no real shipments booked)' : '(LIVE — real pickups & charges will occur)'}
        </label>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">
            API Key {form.has_api_key && <span className="text-green-700">(saved)</span>}
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={form.has_api_key ? 'Leave blank to keep existing key' : 'Paste once Leopards gives you API access'}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
          />
        </div>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">
            API Password {form.has_api_password && <span className="text-green-700">(saved)</span>}
          </label>
          <input
            type="password"
            value={apiPasswordInput}
            onChange={(e) => setApiPasswordInput(e.target.value)}
            placeholder={form.has_api_password ? 'Leave blank to keep existing password' : 'Enter your Leopards API password'}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
          />
        </div>

        {isLeopards && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[#4b4b4b] mb-1">Default Package Weight (grams)</label>
                <input
                  name="default_weight_grams"
                  type="number"
                  min="1"
                  value={form.default_weight_grams}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#4b4b4b] mb-1">Origin City</label>
                <input
                  name="origin_city"
                  value={form.origin_city}
                  onChange={handleChange}
                  placeholder="self"
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                />
                <p className="text-[12px] text-[#9ca3af] mt-1">Leave as "self" to use your registered shipper city.</p>
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Shipper ID (optional)</label>
              <input
                name="shipper_id"
                value={form.shipper_id}
                onChange={handleChange}
                placeholder="Only needed for multi-shipper Leopards accounts"
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !form.has_api_key || !form.has_api_password}
                className="rounded-md border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[13px] font-medium px-4 py-2 transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <p className="text-[12px] text-[#9ca3af] mt-1">
                Save your credentials first, then test — this checks the saved credentials against Leopards without booking anything.
              </p>
            </div>
          </>
        )}

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Tracking URL Template</label>
          <input
            name="tracking_url_template"
            value={form.tracking_url_template}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
          <p className="text-[12px] text-[#9ca3af] mt-1">
            Must include <code>{'{tracking_number}'}</code>. This builds the "Track Package" link shown to customers.
          </p>
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
