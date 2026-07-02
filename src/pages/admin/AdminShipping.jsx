import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function AdminShipping() {
  const [fee, setFee] = useState('1800')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get('/content/shipping-settings')
      .then((data) => setFee(String(data.fee ?? 1800)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/admin/content/shipping-settings', { fee: Number(fee) || 0 }, { auth: true })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[480px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Shipping</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved.</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Flat Shipping Fee (PKR)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
          <p className="text-[12px] text-[#9ca3af] mt-1">Charged on every order at checkout, regardless of destination.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}