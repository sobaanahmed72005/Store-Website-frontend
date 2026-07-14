import { Fragment, useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAdminForm } from '../../hooks/useAdminForm'

const emptyForm = { product_id: '', author_name: '', rating: '5', comment: '' }

const STATUS_STYLE = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABEL = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('pending') // 'all' | 'pending' | 'approved' | 'rejected'
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [actingId, setActingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  // Re-fetches whenever `filter` changes — it's a dependency of `load`, so a filter change gives
  // `load` (and therefore the hook's reload effect) a new identity and it runs again on its own.
  const load = useCallback(() => {
    const qs = filter === 'all' ? '' : `?status=${filter}`
    return api.get(`/admin/reviews${qs}`, { auth: true }).then(setReviews)
  }, [filter])
  const { loading, error, setError, reload: loadReviews } = useAdminForm(load)

  useEffect(() => {
    api.get('/admin/products', { auth: true }).then(setProducts).catch((err) => setError(err.message))
  }, [setError])

  const handleFilterChange = (f) => setFilter(f)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product_id || !form.author_name.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(
        `/admin/products/${form.product_id}/reviews`,
        { author_name: form.author_name.trim(), rating: Number(form.rating), comment: form.comment || null },
        { auth: true },
      )
      setForm(emptyForm)
      loadReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAction = async (id, action) => {
    setActingId(id)
    setError('')
    try {
      await api.patch(`/admin/reviews/${id}`, { action }, { auth: true })
      loadReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setActingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return
    setActingId(id)
    setError('')
    try {
      await api.del(`/admin/reviews/${id}`, { auth: true })
      loadReviews()
    } catch (err) {
      setError(err.message)
    } finally {
      setActingId(null)
    }
  }

  const pendingCount = reviews.filter((r) => r.status === 'pending').length

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Reviews</h1>
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Approve or reject customer reviews before they appear on product pages. You can also seed a review manually.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      {/* Seed form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-white rounded-[10px] border border-[#dedede] p-5 mb-6">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Product</label>
          <select
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            required
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary bg-white"
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Reviewer Name</label>
          <input
            name="author_name"
            value={form.author_name}
            onChange={handleChange}
            required
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Rating</label>
          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary bg-white"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Comment</label>
          <input
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Optional"
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Review'}
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'pending',  label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'all',      label: 'All' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleFilterChange(key)}
            className={`rounded-full text-[13px] font-medium px-4 py-1.5 transition-colors ${
              filter === key
                ? 'bg-cz-primary text-white'
                : 'bg-cz-gold-light text-[#212121] hover:bg-cz-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reviews table */}
      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Comment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#4b4b4b]">Loading...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#4b4b4b]">
                  {filter === 'pending' ? 'No reviews waiting for approval.' : 'No reviews found.'}
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <Fragment key={r.id}>
                  <tr className={`border-t border-[#dedede] ${r.status === 'pending' ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3 text-[#212121]">{r.product_name}</td>
                    <td className="px-4 py-3 text-[#212121]">{r.author_name}</td>
                    <td className="px-4 py-3 text-[#212121]">{r.rating} ★</td>
                    <td className="px-4 py-3 text-[#4b4b4b] max-w-[200px]">
                      {r.comment ? (
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                          className="block w-full max-w-[200px] truncate text-left hover:text-cz-primary hover:underline"
                        >
                          {r.comment}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full text-[11px] font-semibold px-2.5 py-1 ${STATUS_STYLE[r.status] || ''}`}>
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4b4b4b] whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        {r.status !== 'approved' && (
                          <button
                            type="button"
                            disabled={actingId === r.id}
                            onClick={() => handleAction(r.id, 'approve')}
                            className="rounded-md bg-green-600 hover:bg-green-700 text-white text-[12px] font-medium px-3 py-1 transition-colors disabled:opacity-60"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={actingId === r.id}
                            onClick={() => handleAction(r.id, 'reject')}
                            className="rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-[12px] font-medium px-3 py-1 transition-colors disabled:opacity-60"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={actingId === r.id}
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 hover:underline text-[12px] font-medium disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr className="border-t border-[#dedede] bg-cz-gold-light">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="text-[13px] font-medium text-[#212121] mb-1">
                          {r.author_name} on {r.product_name}
                        </div>
                        <p className="text-[13px] text-[#4b4b4b] whitespace-pre-wrap">{r.comment}</p>
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