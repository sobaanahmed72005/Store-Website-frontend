import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const emptyMethods = {
  bank_transfer: { enabled: false, label: 'Bank Transfer', bankName: '', accountTitle: '', accountNumber: '', instructions: '' },
  jazzcash: { enabled: false, label: 'JazzCash', accountTitle: '', number: '', instructions: '' },
  easypaisa: { enabled: false, label: 'EasyPaisa', accountTitle: '', number: '', instructions: '' },
  cod: { enabled: false, label: 'Cash on Delivery', instructions: '' },
}

export default function AdminPayments() {
  const [methods, setMethods] = useState(emptyMethods)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/content/payment-settings')
      .then((data) => setMethods({ ...emptyMethods, ...data.methods }))
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

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[640px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Payment Methods</h1>
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Configure your payment options. These require manual verification in Admin → Orders.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
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
