import { Fragment, useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'

export default function AdminCustomers() {
  const { format } = useCurrency()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [details, setDetails] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/admin/customers', { auth: true })
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (customer) => {
    if (expandedId === customer.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(customer.id)
    if (!details[customer.id]) {
      try {
        const detail = await api.get(`/admin/customers/${customer.id}`, { auth: true })
        setDetails((prev) => ({ ...prev, [customer.id]: detail }))
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone || '').includes(q)
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-[22px] font-semibold text-[#212121]">Customers</h1>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary w-full max-w-[320px]"
        />
      </div>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email Verified</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No customers found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <Fragment key={c.id}>
                  <tr className="border-t border-[#dedede] cursor-pointer" onClick={() => toggleExpand(c)}>
                    <td className="px-4 py-3 text-[#212121]">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[12px] text-[#9ca3af]">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#4b4b4b]">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full text-[12px] font-medium px-3 py-1 ${
                          c.email_verified ? 'bg-cz-primary text-white' : 'bg-cz-gold-light text-cz-ink'
                        }`}
                      >
                        {c.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#212121]">{c.order_count}</td>
                    <td className="px-4 py-3 text-[#212121]">{format(c.total_spent)}</td>
                    <td className="px-4 py-3 text-[#4b4b4b]">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                  {expandedId === c.id && (
                    <tr className="border-t border-[#dedede] bg-cz-gold-light">
                      <td colSpan={6} className="px-4 py-4">
                        {!details[c.id] ? (
                          <div className="text-[13px] text-[#9ca3af]">Loading orders...</div>
                        ) : details[c.id].orders.length === 0 ? (
                          <div className="text-[13px] text-[#9ca3af]">This customer hasn&apos;t placed any orders yet.</div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {details[c.id].orders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between text-[13px] text-[#212121]">
                                <span>
                                  Order #{order.id} — {new Date(order.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-3">
                                  <span className="text-[#4b4b4b] capitalize">{order.status.replace(/_/g, ' ')}</span>
                                  <span>{format(order.total_amount)}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
