import { Fragment, useCallback, useState } from 'react'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useCurrency } from '../../store/currencyStore'
import { useAdminForm } from '../../hooks/useAdminForm'
import Pagination from '../../components/Pagination'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

export default function AdminCustomers() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Customers — Manage Your Store | ${siteName || 'IT Solutions'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  const { format } = useCurrency()
  const [customers, setCustomers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [details, setDetails] = useState({})
  const [search, setSearch] = useState('')

  const applyCustomersPage = (data) => {
    setCustomers(data.customers)
    setPage(data.page)
    setTotalPages(data.totalPages)
  }

  // Server-paginated (50/page) so the customer table can't grow into an unbounded fetch. The
  // search box below only filters within the current page — a search spanning the whole customer
  // base would need server-side search support this endpoint doesn't have yet.
  const load = useCallback(() => api.get(ENDPOINTS.ADMIN.CUSTOMERS.BASE(), { auth: true }).then(applyCustomersPage), [])
  const { loading, error, setError } = useAdminForm(load)

  const goToPage = (nextPage) => api.get(ENDPOINTS.ADMIN.CUSTOMERS.BASE(`?page=${nextPage}`), { auth: true }).then(applyCustomersPage)

  const toggleExpand = async (customer) => {
    if (expandedId === customer.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(customer.id)
    if (!details[customer.id]) {
      try {
        const detail = await api.get(ENDPOINTS.ADMIN.CUSTOMERS.BY_ID(customer.id), { auth: true })
        setDetails((prev) => ({ ...prev, [customer.id]: detail }))
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const [editingCityId, setEditingCityId] = useState(null)
  const [cityDraft, setCityDraft] = useState('')
  const [savingCity, setSavingCity] = useState(false)
  const [successNotice, setSuccessNotice] = useState('')

  const handleStartEditCity = (e, customer) => {
    e.stopPropagation()
    setEditingCityId(customer.id)
    setCityDraft(customer.saved_city || '')
    setError('')
    setSuccessNotice('')
  }

  const handleSaveCity = async (e, customerId) => {
    e.stopPropagation()
    if (!cityDraft.trim()) {
      setError('City cannot be empty')
      return
    }
    setSavingCity(true)
    setError('')
    try {
      await api.put(ENDPOINTS.ADMIN.CUSTOMERS.CITY(customerId), { saved_city: cityDraft.trim() }, { auth: true })
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, saved_city: cityDraft.trim() } : c))
      )
      setEditingCityId(null)
      setSuccessNotice(`City updated to "${cityDraft.trim()}" (synced to unshipped orders).`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingCity(false)
    }
  }

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.saved_city || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-[22px] font-semibold text-[#212121]">Customers</h1>
        <SeoHeadingFiller h2="Customer list" h3="Search" h4="Customer details" h5="Order history" h6="Contact info" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary w-full max-w-[320px]"
        />
      </div>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {successNotice && <div className="text-[14px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-4 font-medium">{successNotice}</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">City</th>
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
                <td colSpan={7} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#4b4b4b]">
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
                    <td className="px-4 py-3 text-[#4b4b4b]" onClick={(e) => e.stopPropagation()}>
                      {editingCityId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={cityDraft}
                            onChange={(e) => setCityDraft(e.target.value)}
                            className="w-[120px] rounded border border-[#d1d5db] text-[13px] px-2 py-1 outline-none focus:border-cz-primary"
                            placeholder="City name"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={savingCity}
                            onClick={(e) => handleSaveCity(e, c.id)}
                            className="rounded bg-cz-primary text-white text-[12px] px-2 py-1 font-medium hover:bg-cz-primary-hover disabled:opacity-60"
                          >
                            {savingCity ? '...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCityId(null)
                            }}
                            className="rounded border border-[#d1d5db] text-[12px] px-2 py-1 font-medium hover:bg-gray-100 text-[#4b4b4b]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#212121]">{c.saved_city || '—'}</span>
                          <button
                            type="button"
                            onClick={(e) => handleStartEditCity(e, c)}
                            className="text-[12px] text-cz-primary hover:underline font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      )}
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
                      <td colSpan={7} className="px-4 py-4">
                        {!details[c.id] ? (
                          <div className="text-[13px] text-[#9ca3af]">Loading orders...</div>
                        ) : details[c.id].orders.length === 0 ? (
                          <div className="text-[13px] text-[#9ca3af]">This customer hasn&apos;t placed any orders yet.</div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {details[c.id].orders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between text-[13px] text-[#212121]">
                                <span>
                                  Order #{order.id} — {new Date(order.created_at).toLocaleDateString()} ({order.shipping_city || 'No city'})
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
      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </div>
  )
}
