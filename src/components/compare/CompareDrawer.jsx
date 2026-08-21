import { useCompareStore } from '../../store/compareStore'

export default function CompareDrawer() {
  const items = useCompareStore((s) => s.items)
  const removeFromCompare = useCompareStore((s) => s.removeFromCompare)
  const clearCompare = useCompareStore((s) => s.clearCompare)
  const openModal = useCompareStore((s) => s.openModal)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-lg border border-slate-700/60 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-6 animate-slideUp">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
          Comparing ({items.length}/4)
        </span>

        <div className="flex items-center gap-2">
          {items.map((item) => (
            <div key={item.id || item.title} className="relative group w-9 h-9 rounded-lg bg-white p-1 border border-slate-700">
              <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => removeFromCompare(item.id || item.slug)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openModal}
          className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
        >
          Compare Now →
        </button>

        <button
          type="button"
          onClick={clearCompare}
          className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
