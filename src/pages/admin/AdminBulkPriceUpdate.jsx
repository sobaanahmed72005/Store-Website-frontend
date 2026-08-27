import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useCurrency } from '../../store/currencyStore'
import { useSiteSettings } from '../../store/siteSettingsStore'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'

export default function AdminBulkPriceUpdate() {
  const { siteName } = useSiteSettings()
  const { format } = useCurrency()

  useSeo({
    title: `Bulk Price Update — Manage Store | ${siteName || 'IT Solutions'} Admin`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)

  // Form State
  const [scope, setScope] = useState('all') // 'all' | 'category' | 'brand'
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [selectedBrandNames, setSelectedBrandNames] = useState([])
  const [targetField, setTargetField] = useState('price') // 'price' | 'discount_price' | 'both'
  const [mode, setMode] = useState('increase') // 'increase' | 'decrease'
  const [adjustmentType, setAdjustmentType] = useState('percentage') // 'percentage' | 'amount'
  const [value, setValue] = useState('10')

  // Preview & Selection State
  const [previewData, setPreviewData] = useState(null)
  const [selectedProductIds, setSelectedProductIds] = useState(new Set())
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(ENDPOINTS.ADMIN.CATEGORIES.BASE),
      api.get(ENDPOINTS.ADMIN.PRODUCTS.BRANDS),
    ])
      .then(([catData, brandData]) => {
        const catList = Array.isArray(catData) ? catData : catData?.categories || []
        setCategories(catList)
        const brandList = Array.isArray(brandData) ? brandData : brandData?.brands || []
        setBrands(brandList)
      })
      .catch((err) => setError(err.message || 'Failed to load initial data'))
      .finally(() => setLoadingInitial(false))
  }, [])

  const parentCategories = categories.filter((c) => !c.parent_id)
  const getSubcategories = (parentId) => categories.filter((c) => c.parent_id === parentId)

  // Category Multi-Select Helpers
  const handleCategoryToggle = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
    setPreviewData(null)
  }

  const handleSelectAllCategories = () => {
    const allIds = categories.map((c) => c.id)
    setSelectedCategoryIds(allIds)
    setPreviewData(null)
  }

  const handleDeselectAllCategories = () => {
    setSelectedCategoryIds([])
    setPreviewData(null)
  }

  // Brand Multi-Select Helpers
  const handleBrandToggle = (bName) => {
    setSelectedBrandNames((prev) =>
      prev.includes(bName) ? prev.filter((b) => b !== bName) : [...prev, bName]
    )
    setPreviewData(null)
  }

  const handleSelectAllBrands = () => {
    setSelectedBrandNames([...brands])
    setPreviewData(null)
  }

  const handleDeselectAllBrands = () => {
    setSelectedBrandNames([])
    setPreviewData(null)
  }

  // Product Preview Selection Helpers
  const handleToggleProduct = (id) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleAllProducts = () => {
    if (!previewData?.preview) return
    if (selectedProductIds.size === previewData.preview.length) {
      setSelectedProductIds(new Set())
    } else {
      setSelectedProductIds(new Set(previewData.preview.map((p) => p.id)))
    }
  }

  const handlePreview = async () => {
    if (!value || Number(value) <= 0) {
      setError('Please enter a valid amount or percentage greater than 0')
      return
    }
    if (scope === 'category' && selectedCategoryIds.length === 0) {
      setError('Please select at least one category or subcategory')
      return
    }
    if (scope === 'brand' && selectedBrandNames.length === 0) {
      setError('Please select at least one brand')
      return
    }

    setError('')
    setSuccessMsg('')
    setLoadingPreview(true)
    try {
      const data = await api.post(
        ENDPOINTS.ADMIN.PRODUCTS.BULK_PRICE_UPDATE_PREVIEW,
        {
          scope,
          categoryIds: scope === 'category' ? selectedCategoryIds : undefined,
          brandNames: scope === 'brand' ? selectedBrandNames : undefined,
          targetField,
          mode,
          adjustmentType,
          value: Number(value),
        },
        { auth: true }
      )
      setPreviewData(data)
      // Select all matched products by default
      if (data?.preview) {
        setSelectedProductIds(new Set(data.preview.map((p) => p.id)))
      }
    } catch (err) {
      setError(err.message || err.error || 'Failed to generate preview')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleApply = async () => {
    if (!value || Number(value) <= 0) {
      setError('Please enter a valid amount or percentage greater than 0')
      return
    }
    if (selectedProductIds.size === 0) {
      setError('Please select at least one product from the preview table')
      return
    }

    const confirmMsg = `Are you sure you want to ${mode} prices by ${value}${
      adjustmentType === 'percentage' ? '%' : ' PKR'
    } for ${selectedProductIds.size} selected products? This will update prices in the database.`
    if (!window.confirm(confirmMsg)) return

    setError('')
    setSuccessMsg('')
    setSubmitting(true)
    try {
      const targetProductIds = Array.from(selectedProductIds)
      const res = await api.post(
        ENDPOINTS.ADMIN.PRODUCTS.BULK_PRICE_UPDATE,
        {
          scope,
          categoryIds: scope === 'category' ? selectedCategoryIds : undefined,
          brandNames: scope === 'brand' ? selectedBrandNames : undefined,
          targetProductIds,
          targetField,
          mode,
          adjustmentType,
          value: Number(value),
        },
        { auth: true }
      )
      setSuccessMsg(res.message || `Successfully updated ${res.updated} products!`)
      // Refresh preview to show new prices
      handlePreview()
    } catch (err) {
      setError(err.message || err.error || 'Bulk price update failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInitial) {
    return <div className="p-8 text-[14px] text-slate-500">Loading catalog settings...</div>
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 mb-1">Bulk Price Update</h1>
        <SeoHeadingFiller h2="Filter by category or brand" h3="Adjustment settings" h4="Preview changes" h5="Apply updates" />
        <p className="text-[14px] text-slate-500">
          Increase or decrease product prices in bulk by a percentage or fixed amount. Select or unselect specific categories, brands, or individual products.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] font-medium flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-medium flex items-center justify-between">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 font-bold ml-2">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Step 1: Select Target Products / Multi-Select Categories & Brands */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cz-primary text-white text-[13px] font-bold">1</span>
            <h2 className="text-[16px] font-bold text-slate-800">Select Scope & Filtering</h2>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Filter Scope</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: '🌐 All Products' },
                { id: 'category', label: '📂 Categories' },
                { id: 'brand', label: '🏷️ Brands' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setScope(s.id)
                    setPreviewData(null)
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-[13px] font-medium transition-all text-center ${
                    scope === s.id
                      ? 'border-cz-primary bg-sky-50/50 text-cz-primary font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Select Category Selection */}
          {scope === 'category' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-slate-700">
                  Select Categories ({selectedCategoryIds.length} selected)
                </label>
                <div className="flex items-center gap-2 text-[12px]">
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="text-cz-primary font-bold hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllCategories}
                    className="text-slate-500 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/40 flex flex-col gap-2">
                {parentCategories.map((parent) => {
                  const subs = getSubcategories(parent.id)
                  const isParentChecked = selectedCategoryIds.includes(parent.id)
                  return (
                    <div key={parent.id} className="flex flex-col gap-1 text-[13px]">
                      <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer hover:text-cz-primary">
                        <input
                          type="checkbox"
                          checked={isParentChecked}
                          onChange={() => handleCategoryToggle(parent.id)}
                          className="w-4 h-4 rounded accent-cz-primary cursor-pointer"
                        />
                        📁 {parent.name}
                      </label>
                      {subs.map((sub) => {
                        const isSubChecked = selectedCategoryIds.includes(sub.id)
                        return (
                          <label key={sub.id} className="flex items-center gap-2 pl-6 text-slate-600 cursor-pointer hover:text-cz-primary">
                            <input
                              type="checkbox"
                              checked={isSubChecked}
                              onChange={() => handleCategoryToggle(sub.id)}
                              className="w-3.5 h-3.5 rounded accent-cz-primary cursor-pointer"
                            />
                            └─ 📂 {sub.name}
                          </label>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Multi-Select Brand Selection */}
          {scope === 'brand' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-slate-700">
                  Select Brands ({selectedBrandNames.length} selected)
                </label>
                <div className="flex items-center gap-2 text-[12px]">
                  <button
                    type="button"
                    onClick={handleSelectAllBrands}
                    className="text-cz-primary font-bold hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllBrands}
                    className="text-slate-500 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/40 grid grid-cols-2 gap-2 text-[13px]">
                {brands.map((b) => {
                  const isChecked = selectedBrandNames.includes(b)
                  return (
                    <label key={b} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-cz-primary font-medium">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBrandToggle(b)}
                        className="w-4 h-4 rounded accent-cz-primary cursor-pointer"
                      />
                      🏷️ {b}
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Configure Price Change */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cz-primary text-white text-[13px] font-bold">2</span>
            <h2 className="text-[16px] font-bold text-slate-800">Configure Price Adjustment</h2>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Target Price Field</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'price', label: 'Regular Price' },
                { id: 'discount_price', label: 'Sale Price' },
                { id: 'both', label: 'Both Prices' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTargetField(f.id)}
                  className={`py-2 px-2.5 rounded-xl border text-[12px] font-medium transition-all text-center ${
                    targetField === f.id
                      ? 'border-cz-primary bg-sky-50/50 text-cz-primary font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Action</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-3.5 py-2.5 outline-none focus:border-cz-primary focus:bg-white font-medium"
              >
                <option value="increase">📈 Increase (+)</option>
                <option value="decrease">📉 Decrease (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Adjustment Type</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-3.5 py-2.5 outline-none focus:border-cz-primary focus:bg-white font-medium"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Fixed Amount (PKR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              {adjustmentType === 'percentage' ? 'Percentage Value (%)' : 'Amount Value (PKR)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={adjustmentType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[15px] font-bold text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-slate-400">
                {adjustmentType === 'percentage' ? '%' : 'PKR'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loadingPreview}
          className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-[14px] font-bold hover:border-slate-400 hover:bg-slate-50 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {loadingPreview ? 'Generating Preview...' : '🔍 Preview Price Changes'}
        </button>

        <button
          type="button"
          onClick={handleApply}
          disabled={submitting || selectedProductIds.size === 0}
          className="px-6 py-3 rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          {submitting ? 'Applying Update...' : `⚡ Apply to ${selectedProductIds.size} Product${selectedProductIds.size === 1 ? '' : 's'}`}
        </button>

        {previewData && (
          <span className="text-[13px] font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl">
            {selectedProductIds.size} of {previewData.totalMatched} products selected
          </span>
        )}
      </div>

      {/* Preview Table with Per-Product Checkboxes */}
      {previewData && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">Preview & Select Products to Update</h3>
              <p className="text-[12px] text-slate-500">Uncheck any products you do not want to change.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleAllProducts}
                className="text-[13px] font-bold text-cz-primary hover:underline cursor-pointer"
              >
                {selectedProductIds.size === previewData.preview.length ? 'Deselect All Products' : 'Select All Products'}
              </button>
            </div>
          </div>

          {previewData.preview.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-[14px]">
              No products found matching the selected filter scope.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-slate-100/70 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.size === previewData.preview.length && previewData.preview.length > 0}
                        onChange={handleToggleAllProducts}
                        className="w-4 h-4 rounded accent-cz-primary cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Regular Price</th>
                    <th className="py-3 px-4">Sale Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.preview.map((item) => {
                    const isChecked = selectedProductIds.has(item.id)
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleToggleProduct(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/60 opacity-60 hover:opacity-80'
                        }`}
                      >
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProduct(item.id)}
                            className="w-4 h-4 rounded accent-cz-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                        <td className="py-3 px-4 text-slate-600">{item.category_name}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{item.brand || '—'}</td>
                        <td className="py-3 px-4 font-medium">
                          {item.current_price !== item.new_price ? (
                            <div className="flex items-center gap-1.5">
                              <span className="line-through text-slate-400">{format(item.current_price)}</span>
                              <span className="text-slate-400">➔</span>
                              <span className="font-bold text-emerald-700">{format(item.new_price)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-700">{format(item.current_price)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {item.current_discount_price != null ? (
                            item.current_discount_price !== item.new_discount_price ? (
                              <div className="flex items-center gap-1.5">
                                <span className="line-through text-slate-400">{format(item.current_discount_price)}</span>
                                <span className="text-slate-400">➔</span>
                                <span className="font-bold text-rose-700">{format(item.new_discount_price)}</span>
                              </div>
                            ) : (
                              <span className="text-rose-600">{format(item.current_discount_price)}</span>
                            )
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
