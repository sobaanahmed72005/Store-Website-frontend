import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const emptyMethods = {
  bank_transfer: { enabled: false, label: 'Bank Transfer', bankName: '', accountTitle: '', accountNumber: '', instructions: '' },
  jazzcash: { enabled: false, label: 'JazzCash', accountTitle: '', number: '', instructions: '' },
  easypaisa: { enabled: false, label: 'EasyPaisa', accountTitle: '', number: '', instructions: '' },
  cod: { enabled: false, label: 'Cash on Delivery', instructions: '' },
}

const emptyPaymob = { enabled: false, sandbox: true, public_key: '', integration_ids: '', has_secret: false, has_hmac_secret: false }

export default function AdminPayments() {
  const [methods, setMethods] = useState(emptyMethods)
  const [paymob, setPaymob] = useState(emptyPaymob)
  const [paymobSecret, setPaymobSecret] = useState('')
  const [paymobHmacSecret, setPaymobHmacSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPaymob, setSavingPaymob] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [savedPaymob, setSavedPaymob] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/content/payment-settings').then((data) => setMethods({ ...emptyMethods, ...data.methods })),
      api.get('/admin/payment-gateways/paymob', { auth: true }).then(setPaymob),
    ])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const updateMethod = (key, field, value) =>
    setMethods((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/admin/content/payment-settings', { methods }, { auth: true })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePaymobSubmit = async (e) => {
    e.preventDefault()
    setSavingPaymob(true)
    setError('')
    setSavedPaymob(false)
    try {
      await api.put('/admin/payment-gateways/paymob', {
        enabled: paymob.enabled,
        sandbox: paymob.sandbox,
        public_key: paymob.public_key,
        integration_ids: paymob.integration_ids,
        secret_key: paymobSecret || undefined,
        hmac_secret: paymobHmacSecret || undefined,
      }, { auth: true })
      setSavedPaymob(true)
      setPaymobSecret('')
      setPaymobHmacSecret('')
      const fresh = await api.get('/admin/payment-gateways/paymob', { auth: true })
      setPaymob(fresh)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPaymob(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[640px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Payment Methods</h1>
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Configure your payment options. Paymob auto-confirms payments; bank/wallet methods require manual verification in Admin → Orders.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      {/* ── Paymob gateway ── */}
      <div className="mb-2 text-[13px] font-semibold text-[#4b4b4b] uppercase tracking-wide">Online Gateway</div>
      <form onSubmit={handlePaymobSubmit} className="flex flex-col gap-4 mb-8">
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[15px] font-semibold text-[#212121]">Paymob</div>
              <div className="text-[12px] text-[#9ca3af] mt-0.5">
                Customers pay online (card, JazzCash, EasyPaisa) — payment is confirmed automatically. Get your keys from your Paymob dashboard.
              </div>
            </div>
            <label className="flex items-center gap-2 shrink-0 mt-1">
              <input
                type="checkbox"
                checked={paymob.enabled}
                onChange={(e) => setPaymob((p) => ({ ...p, enabled: e.target.checked }))}
              />
              <span className="text-[13px] text-[#4b4b4b]">Enabled</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-[#4b4b4b]">
            <input
              type="checkbox"
              checked={paymob.sandbox}
              onChange={(e) => setPaymob((p) => ({ ...p, sandbox: e.target.checked }))}
            />
            Test mode (using test API keys — uncheck once you switch to live keys)
          </label>

          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Public Key</label>
            <input
              value={paymob.public_key}
              onChange={(e) => setPaymob((p) => ({ ...p, public_key: e.target.value }))}
              placeholder="pk_test_xxxxxxxxxx"
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">
              Secret Key {paymob.has_secret && <span className="text-green-700">(saved)</span>}
            </label>
            <input
              type="password"
              value={paymobSecret}
              onChange={(e) => setPaymobSecret(e.target.value)}
              placeholder={paymob.has_secret ? 'Leave blank to keep existing key' : 'Enter your Paymob secret key'}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">
              HMAC Secret {paymob.has_hmac_secret && <span className="text-green-700">(saved)</span>}
            </label>
            <input
              type="password"
              value={paymobHmacSecret}
              onChange={(e) => setPaymobHmacSecret(e.target.value)}
              placeholder={paymob.has_hmac_secret ? 'Leave blank to keep existing key' : 'Found in your Paymob dashboard profile tab'}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
            />
            <p className="text-[12px] text-[#9ca3af] mt-1">
              A separate key from the Secret Key above — used only to verify that payment confirmations really came from Paymob.
            </p>
          </div>

          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Integration IDs</label>
            <input
              value={paymob.integration_ids}
              onChange={(e) => setPaymob((p) => ({ ...p, integration_ids: e.target.value }))}
              placeholder="e.g. 123456, 123457"
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
            />
            <p className="text-[12px] text-[#9ca3af] mt-1">
              Comma-separated Integration IDs from your Paymob dashboard — one per enabled payment channel (card, JazzCash, EasyPaisa).
              In your Paymob dashboard, also set each integration's webhook/callback URL to this store's payment webhook address.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingPaymob}
              className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
            >
              {savingPaymob ? 'Saving...' : 'Save Paymob Settings'}
            </button>
            {savedPaymob && <span className="text-[13px] text-green-700">Saved.</span>}
          </div>
        </div>
      </form>

      {/* ── Manual transfer methods ── */}
      <div className="mb-2 text-[13px] font-semibold text-[#4b4b4b] uppercase tracking-wide">Manual Transfer</div>
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved.</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-[15px] font-semibold text-[#212121]">
            <input
              type="checkbox"
              checked={methods.bank_transfer.enabled}
              onChange={(e) => updateMethod('bank_transfer', 'enabled', e.target.checked)}
            />
            Bank Transfer
          </label>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Bank Name</label>
            <input
              value={methods.bank_transfer.bankName}
              onChange={(e) => updateMethod('bank_transfer', 'bankName', e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Account Title</label>
            <input
              value={methods.bank_transfer.accountTitle}
              onChange={(e) => updateMethod('bank_transfer', 'accountTitle', e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Account Number / IBAN</label>
            <input
              value={methods.bank_transfer.accountNumber}
              onChange={(e) => updateMethod('bank_transfer', 'accountNumber', e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Extra Instructions (optional)</label>
            <textarea
              value={methods.bank_transfer.instructions}
              onChange={(e) => updateMethod('bank_transfer', 'instructions', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-[15px] font-semibold text-[#212121]">
            <input
              type="checkbox"
              checked={methods.cod.enabled}
              onChange={(e) => updateMethod('cod', 'enabled', e.target.checked)}
            />
            Cash on Delivery
          </label>
          <p className="text-[12px] text-[#9ca3af] -mt-1">Customer pays in cash when the order is delivered. You confirm payment manually in Admin → Orders.</p>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Extra Instructions (optional)</label>
            <textarea
              value={methods.cod.instructions}
              onChange={(e) => updateMethod('cod', 'instructions', e.target.value)}
              rows={2}
              placeholder="e.g. Exact change appreciated."
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
            />
          </div>
        </div>

        {['jazzcash', 'easypaisa'].map((key) => (
          <div key={key} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[15px] font-semibold text-[#212121]">
              <input
                type="checkbox"
                checked={methods[key].enabled}
                onChange={(e) => updateMethod(key, 'enabled', e.target.checked)}
              />
              {methods[key].label}
            </label>
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Account Title</label>
              <input
                value={methods[key].accountTitle}
                onChange={(e) => updateMethod(key, 'accountTitle', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">{methods[key].label} Number</label>
              <input
                value={methods[key].number}
                onChange={(e) => updateMethod(key, 'number', e.target.value)}
                placeholder="03xxxxxxxxx"
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Extra Instructions (optional)</label>
              <textarea
                value={methods[key].instructions}
                onChange={(e) => updateMethod(key, 'instructions', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
              />
            </div>
          </div>
        ))}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Manual Methods'}
          </button>
        </div>
      </form>
    </div>
  )
}