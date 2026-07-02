import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function AdminBulkSale() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [scope, setScope] = useState('all')
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [discountType, setDiscountType] = useState('percent')
  const [value, setValue] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    api.get('/admin/products', { auth: true }).then(setProducts).catch(() => {})
    api.get('/admin/categories', { auth: true }).then(setCategories).catch(() => {})
  }, [])

  const topLevelCategories = categories.filter((c) => !c.parent_id)
  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))

  const toggleProduct = (id) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const scopeDescription = () => {
    if (scope === 'all') return 'all products in the store'
    if (scope === 'products') return `${selectedProductIds.length} selected product(s)`
    return `${selectedCategoryIds.length} selected category/categories (including their subcategories)`
  }

  const buildPayload = (action) => {
    const payload = { scope, action }
    if (scope === 'products') payload.productIds = selectedProductIds
    if (scope === 'categories') payload.categoryIds = selectedCategoryIds
    if (action === 'apply') {
      payload.discountType = discountType
      payload.value = Number(value)
    }
    return payload
  }

  const handleApply = async () => {
    setError('')
    setResult('')
    if (scope === 'products' && selectedProductIds.length === 0) return setError('Select at least one product.')
    if (scope === 'categories' && selectedCategoryIds.length === 0) return setError('Select at least one category.')
    if (!value || Number(value) <= 0) return setError('Enter a valid discount value.')

    setSaving(true)
    try {
      const data = await api.post('/admin/products/bulk-sale', buildPayload('apply'), { auth: true })
      setResult(`Sale applied to ${data.updated} product(s).`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    setError('')
    setResult('')
    if (scope === 'products' && selectedProductIds.length === 0) return setError('Select at least one product.')
    if (scope === 'categories' && selectedCategoryIds.length === 0) return setError('Select at least one category.')

    setSaving(true)
    try {
      const data = await api.post('/admin/products/bulk-sale', buildPayload('clear'), { auth: true })
      setResult(`Sale cleared on ${data.updated} product(s).`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-[760px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-2">Bulk Sale</h1>
      <p className="text-[14px] text-[#4b4b4b] mb-6">
        Apply or clear a sale price across many products at once.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {result && <div className="text-[14px] text-green-700 mb-4">{result}</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-5 mb-6">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-2">Apply to</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-[14px] text-[#212121]">
              <input type="radio" name="scope" value="all" checked={scope === 'all'} onChange={() => setScope('all')} />
              All products
            </label>
            <label className="flex items-center gap-2 text-[14px] text-[#212121]">
              <input type="radio" name="scope" value="products" checked={scope === 'products'} onChange={() => setScope('products')} />
              Selected products
            </label>
            <label className="flex items-center gap-2 text-[14px] text-[#212121]">
              <input type="radio" name="scope" value="categories" checked={scope === 'categories'} onChange={() => setScope('categories')} />
              Selected categories (subcategories included automatically)
            </label>
          </div>
        </div>

        {scope === 'products' && (
          <div>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary mb-2"
            />
            <div className="max-h-[260px] overflow-y-auto border border-[#dedede] rounded-md p-3 flex flex-col gap-1.5">
              {filteredProducts.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-[14px] text-[#212121]">
                  <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                  {p.name}
                  <span className="text-[12px] text-[#9ca3af]">Rs. {Number(p.price).toLocaleString()}</span>
                </label>
              ))}
              {filteredProducts.length === 0 && <span className="text-[13px] text-[#9ca3af]">No products match.</span>}
            </div>
            <div className="text-[12px] text-[#9ca3af] mt-1">{selectedProductIds.length} selected</div>
          </div>
        )}

        {scope === 'categories' && (
          <div className="max-h-[260px] overflow-y-auto border border-[#dedede] rounded-md p-3 flex flex-col gap-1.5">
            {topLevelCategories.map((parent) => (
              <div key={parent.id}>
                <label className="flex items-center gap-2 text-[14px] font-medium text-[#212121]">
                  <input type="checkbox" checked={selectedCategoryIds.includes(parent.id)} onChange={() => toggleCategory(parent.id)} />
                  {parent.name}
                </label>
                {categories
                  .filter((c) => c.parent_id === parent.id)
                  .map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 text-[14px] text-[#4b4b4b] ml-6">
                      <input type="checkbox" checked={selectedCategoryIds.includes(sub.id)} onChange={() => toggleCategory(sub.id)} />
                      {sub.name}
                    </label>
                  ))}
              </div>
            ))}
            {topLevelCategories.length === 0 && <span className="text-[13px] text-[#9ca3af]">No categories yet.</span>}
          </div>
        )}

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-2">Discount</label>
          <div className="flex items-center gap-3">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary bg-white"
            >
              <option value="percent">Percentage Off</option>
              <option value="fixed">Set Fixed Sale Price</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={discountType === 'percent' ? 'e.g. 20' : 'e.g. 4999'}
              className="w-[160px] rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
            <span className="text-[13px] text-[#4b4b4b]">{discountType === 'percent' ? '% off current price' : 'PKR flat price'}</span>
          </div>
        </div>

        <p className="text-[13px] text-[#4b4b4b]">
          This will apply to <strong>{scopeDescription()}</strong>.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleApply}
            disabled={saving}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? 'Applying...' : 'Apply Sale'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={saving}
            className="rounded-md border border-[#d1d5db] text-[#212121] text-[14px] font-medium px-6 py-2.5 disabled:opacity-60"
          >
            Clear Sale
          </button>
        </div>
      </div>
    </div>
  )
}
