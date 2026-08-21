import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useCurrencyStore, parsePkr } from '../../store/currencyStore'

export default function SpotlightSearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { format } = useCurrencyStore()

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const timeout = setTimeout(() => {
      api.get(ENDPOINTS.PRODUCTS.LIST, { params: { search: query.trim(), limit: 8 } })
        .then((res) => {
          const list = res.products || res || []
          setResults(list)
          setSelectedIndex(0)
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  const handleSelect = (product) => {
    setIsOpen(false)
    if (product.slug) {
      navigate(`/product/${product.slug}`)
    } else {
      navigate(`/shop?search=${encodeURIComponent(product.title)}`)
    }
  }

  const handleKeyDownInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 bg-slate-900/75 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp flex flex-col"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="text-slate-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder="Search laptops, GPUs, processors, accessories... (Type to search)"
            className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none placeholder-slate-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">Searching store catalog...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No products found matching &quot;{query}&quot;
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 text-xs text-slate-400 flex flex-col gap-2">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Quick Suggestions</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Gaming Laptop', 'RTX 4070', 'Intel i7', 'OLED Monitor', 'Mechanical Keyboard'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 transition-colors text-xs font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && results.map((item, i) => (
            <div
              key={item.id || item.title}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                i === selectedIndex ? 'bg-cyan-50 border border-cyan-200/80 shadow-sm' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white p-1 border border-slate-100 shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</span>
                  <span className="text-[11px] text-slate-400">{item.categoryName || 'Hardware'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-slate-900">{format(parsePkr(item.price))}</span>
                <span className="text-cyan-600 text-xs">↵</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Shortcut Info */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Ctrl + K</kbd> anytime</span>
        </div>
      </div>
    </div>
  )
}
