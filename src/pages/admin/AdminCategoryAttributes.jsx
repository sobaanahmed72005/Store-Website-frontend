import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { ADMIN_PATH } from '../../config/adminPath'

export default function AdminCategoryAttributes() {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newAttrName, setNewAttrName] = useState('')
  const [optionDrafts, setOptionDrafts] = useState({})
  const ownAttributes = attributes.filter((attr) => !attr.inherited)
  const inheritedAttributes = attributes.filter((attr) => attr.inherited)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/categories', { auth: true }).then((cats) => cats.find((c) => String(c.id) === id)),
      api.get(`/admin/categories/${id}/attributes?effective=1`, { auth: true }),
    ])
      .then(([cat, attrs]) => {
        setCategory(cat)
        setAttributes(attrs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  const handleAddAttribute = async (e) => {
    e.preventDefault()
    if (!newAttrName.trim()) return
    setError('')
    try {
      await api.post(`/admin/categories/${id}/attributes`, { name: newAttrName.trim() }, { auth: true })
      setNewAttrName('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteAttribute = async (attrId) => {
    if (!window.confirm('Delete this filter and all its options? This also removes it from any products.')) return
    try {
      await api.del(`/admin/attributes/${attrId}`, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddOption = async (e, attrId) => {
    e.preventDefault()
    const value = optionDrafts[attrId]?.trim()
    if (!value) return
    setError('')
    try {
      await api.post(`/admin/attributes/${attrId}/options`, { value }, { auth: true })
      setOptionDrafts((prev) => ({ ...prev, [attrId]: '' }))
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteOption = async (optId) => {
    try {
      await api.del(`/admin/options/${optId}`, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRenameOption = async (opt) => {
    const value = window.prompt('Rename option', opt.value)
    if (!value?.trim() || value.trim() === opt.value) return
    setError('')
    try {
      await api.patch(`/admin/options/${opt.id}`, { value: value.trim() }, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-1">
        <Link to={`${ADMIN_PATH}/categories`} className="text-[13px] text-cz-primary hover:underline">
          ← Categories
        </Link>
      </div>
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">
        Filters{category ? ` — ${category.name}` : ''}
      </h1>
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Define product specification filters customers can use on this category's storefront page, e.g. Processor or RAM for Laptops.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleAddAttribute} className="flex items-end gap-3 bg-white rounded-[10px] border border-[#dedede] p-5 mb-6">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">New filter name</label>
          <input
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="e.g. Processor"
            className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors"
        >
          Add Filter
        </button>
      </form>

      {loading ? (
        <div className="text-[14px] text-[#4b4b4b]">Loading...</div>
      ) : (
        <>
          {ownAttributes.length === 0 ? (
            <div className="text-[14px] text-[#4b4b4b] mb-6">No filters yet for this category.</div>
          ) : (
            <div className="flex flex-col gap-4 mb-6">
              {ownAttributes.map((attr) => (
                <div key={attr.id} className="bg-white rounded-[10px] border border-[#dedede] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[16px] font-semibold text-[#212121]">{attr.name}</h2>
                    <button type="button" onClick={() => handleDeleteAttribute(attr.id)} className="text-[13px] text-red-600 hover:underline">
                      Delete filter
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {attr.options.length === 0 ? (
                      <span className="text-[13px] text-[#4b4b4b]">No options yet.</span>
                    ) : (
                      attr.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="flex items-center gap-2 rounded-full bg-cz-gold-light text-[13px] text-[#212121] px-3 py-1.5"
                        >
                          <button
                            type="button"
                            onClick={() => handleRenameOption(opt)}
                            className="hover:underline"
                            title="Click to rename"
                          >
                            {opt.value}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(opt.id)}
                            className="text-[#4b4b4b] hover:text-red-600"
                            aria-label={`Remove ${opt.value}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <form onSubmit={(e) => handleAddOption(e, attr.id)} className="flex items-center gap-2">
                    <input
                      value={optionDrafts[attr.id] || ''}
                      onChange={(e) => setOptionDrafts((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                      placeholder="e.g. Intel Core i5"
                      className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                    />
                    <button type="submit" className="text-[13px] text-cz-primary hover:underline">
                      Add option
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {inheritedAttributes.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold text-[#212121] mb-1">Inherited from parent category</h2>
              <p className="text-[13px] text-[#4b4b4b] mb-3">
                These filters were defined on a parent category and automatically apply here too. Edit them from that parent category's Filters page.
              </p>
              <div className="flex flex-col gap-4">
                {inheritedAttributes.map((attr) => (
                  <div key={attr.id} className="bg-[#fafafa] rounded-[10px] border border-[#dedede] p-5">
                    <h3 className="text-[16px] font-semibold text-[#212121] mb-3">{attr.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.length === 0 ? (
                        <span className="text-[13px] text-[#4b4b4b]">No options yet.</span>
                      ) : (
                        attr.options.map((opt) => (
                          <span
                            key={opt.id}
                            className="rounded-full bg-white border border-[#dedede] text-[13px] text-[#212121] px-3 py-1.5"
                          >
                            {opt.value}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}