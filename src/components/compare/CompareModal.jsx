import { useState } from 'react'
import { useCompareStore } from '../../store/compareStore'
import { useCurrencyStore, parsePkr } from '../../store/currencyStore'
import Product3DCanvas from '../3d/Product3DCanvas'

export default function CompareModal() {
  const [viewMode, setViewMode] = useState('photo') // 'photo' or '3d'
  const items = useCompareStore((s) => s.items)
  const isModalOpen = useCompareStore((s) => s.isModalOpen)
  const closeModal = useCompareStore((s) => s.closeModal)
  const removeFromCompare = useCompareStore((s) => s.removeFromCompare)
  const { format } = useCurrencyStore()

  if (!isModalOpen || items.length === 0) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 p-6 max-h-[90vh] flex flex-col gap-6">
        {/* Header Bar with Inline View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Product Comparison</h2>
            <p className="text-xs text-slate-500">Side-by-side specification & visual comparison</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle Pill Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full">
              <button
                type="button"
                onClick={() => setViewMode('photo')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'photo'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🖼 Photo View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧊 Interactive 3D View
              </button>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="p-3 text-xs font-bold text-slate-400 w-1/5">Product</th>
                {items.map((item) => (
                  <th key={item.id || item.title} className="p-3 w-1/5 text-center relative">
                    <button
                      type="button"
                      onClick={() => removeFromCompare(item.id || item.slug)}
                      className="absolute top-1 right-1 text-slate-400 hover:text-rose-500 text-xs p-1"
                      title="Remove product"
                    >
                      ✕
                    </button>

                    {/* Single Display Box rendering either 2D Photo or 3D Canvas */}
                    <div className="w-24 h-24 md:w-28 md:h-28 mx-auto bg-slate-50 rounded-xl p-2 border border-slate-200 mb-2.5 flex items-center justify-center overflow-hidden">
                      {viewMode === 'photo' ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      ) : (
                        <Product3DCanvas title={item.title} className="w-full h-full" />
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-800 line-clamp-2">{item.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              <tr>
                <td className="p-3.5 font-semibold text-slate-500">Price</td>
                {items.map((item) => (
                  <td key={item.id || item.title} className="p-3.5 text-center font-bold text-slate-900 text-sm">
                    {format(parsePkr(item.price))}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-500">Stock Status</td>
                {items.map((item) => (
                  <td key={item.id || item.title} className="p-3.5 text-center font-semibold text-emerald-600">
                    In Stock
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-slate-500">Category</td>
                {items.map((item) => (
                  <td key={item.id || item.title} className="p-3.5 text-center">
                    {item.categoryName || 'Hardware'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
