import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const ACTION_LABELS = {
  'product.create': 'Created product',
  'product.update': 'Updated product',
  'product.delete': 'Deleted product',
  'discount_code.create': 'Created discount code',
  'discount_code.update': 'Updated discount code',
  'discount_code.delete': 'Deleted discount code',
  'order.status_change': 'Changed order status',
  'payment_settings.update': 'Updated payment settings',
  'courier_settings.update': 'Updated courier settings',
}

function formatDetails(entry) {
  const d = entry.details
  if (!d) return null

  switch (entry.action) {
    case 'product.create':
      return `${d.name} — price Rs. ${d.price}, stock ${d.stock}`
    case 'product.update':
      return `${d.name} — price ${d.price.from} → ${d.price.to}, stock ${d.stock.from} → ${d.stock.to}`
    case 'product.delete':
      return d.name
    case 'discount_code.create':
      return `${d.code} — ${d.discount_type === 'percent' ? `${d.discount_value}%` : `Rs. ${d.discount_value}`}`
    case 'discount_code.update':
      return `${d.code} — active: ${d.is_active.from} → ${d.is_active.to}`
    case 'discount_code.delete':
      return d.code
    case 'order.status_change':
      return `#${entry.entity_id} — ${d.status.from} → ${d.status.to}`
    case 'payment_settings.update':
    case 'courier_settings.update':
      return JSON.stringify(d)
    default:
      return JSON.stringify(d)
  }
}

export default function AdminAuditLog() {
  const [entries, setEntries] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get(`/admin/audit-log?page=${page}`)
      .then((data) => {
        setEntries(data.entries)
        setTotalPages(data.totalPages)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-[22px] font-semibold text-[#212121]">Audit Log</h1>
        <p className="text-[13px] text-[#9ca3af]">A record of admin actions on prices, discounts, order status, and payment/courier settings.</p>
      </div>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No admin actions recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-t border-[#dedede]">
                  <td className="px-4 py-3 text-[#4b4b4b] whitespace-nowrap">{new Date(entry.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#212121]">{entry.user_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-[#212121]">{ACTION_LABELS[entry.action] || entry.action}</td>
                  <td className="px-4 py-3 text-[#4b4b4b]">{formatDetails(entry)}</td>
                  <td className="px-4 py-3 text-[#9ca3af]">{entry.ip_address || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[13px] text-[#4b4b4b]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
