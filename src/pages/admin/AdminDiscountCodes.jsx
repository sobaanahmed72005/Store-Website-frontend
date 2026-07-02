import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'

const emptyForm = { code: '', discount_type: 'percent', discount_value: '', expires_at: '', reusable: false }

export default function AdminDiscountCodes() {
  const { format } = useCurrency()
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/admin/discount-codes', { auth: true })
      .then(setCodes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await api.post(
        '/admin/discount-codes',
        {
          code: form.code,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          expires_at: form.expires_at || null,
          reusable: form.reusable,
        },
        { auth: true }
      )
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (codeRow) => {
    try {
      await api.patch(`/admin/discount-codes/${codeRow.id}`, { is_active: !codeRow.is_active }, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount code? Customers will no longer be able to apply it.')) return
    try {
      await api.del(`/admin/discount-codes/${id}`, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Discount Codes</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-white rounded-[10px] border border-[#dedede] p-5 mb-6">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Code</label>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="WELCOME10"
            required
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary uppercase"
          />
        </div>
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Type</label>
          <select
            name="discount_type"
            value={form.discount_type}
            onChange={handleChange}
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary bg-white"
          >
            <option value="percent">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Value</label>
          <input
            name="discount_value"
            type="number"
            min="0"
            step="0.01"
            value={form.discount_value}
            onChange={handleChange}
            placeholder={form.discount_type === 'percent' ? '10' : '500'}
            required
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Expires</label>
          <input
            name="expires_at"
            type="date"
            value={form.expires_at}
            onChange={handleChange}
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
          <p className="text-[12px] text-[#9ca3af] mt-1">Leave blank to never expire.</p>
        </div>
        <label className="flex items-center gap-2 text-[14px] text-[#212121] pb-2.5">
          <input type="checkbox" name="reusable" checked={form.reusable} onChange={handleChange} />
          Ever-lasting (a customer can reuse this code on every order)
        </label>
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'Add Code'}
        </button>
      </form>

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Reuse</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No discount codes yet.
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id} className="border-t border-[#dedede]">
                  <td className="px-4 py-3 text-[#212121] font-medium">{c.code}</td>
                  <td className="px-4 py-3 text-[#212121]">
                    {c.discount_type === 'percent' ? `${Number(c.discount_value)}%` : format(Number(c.discount_value))}
                  </td>
                  <td className="px-4 py-3 text-[#4b4b4b]">{c.reusable ? 'Ever-lasting' : 'Once per customer'}</td>
                  <td className="px-4 py-3 text-[#4b4b4b]">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className={`rounded-full text-[12px] font-medium px-3 py-1 ${
                        c.is_active ? 'bg-cz-primary text-white' : 'bg-[#eee] text-[#4b4b4b]'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}