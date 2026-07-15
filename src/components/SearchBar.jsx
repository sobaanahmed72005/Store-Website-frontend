import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api, resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'
import { useCurrency } from '../store/currencyStore'
import { SearchIcon } from './icons'

const DEBOUNCE_MS = 250

export default function SearchBar({ placeholder = 'What are you looking for?' }) {
  const navigate = useNavigate()
  const { format } = useCurrency()
  const [searchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const debounceTimer = useRef(null)
  const requestId = useRef(0)

  useEffect(() => {
    const query = value.trim()
    clearTimeout(debounceTimer.current)
    if (!query) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const thisRequest = ++requestId.current
    debounceTimer.current = setTimeout(() => {
      api
        .get(`/products/suggest?q=${encodeURIComponent(query)}`)
        .then((data) => {
          if (requestId.current !== thisRequest) return // stale response from an earlier keystroke
          setSuggestions(data)
          setOpen(true)
          setActiveIndex(-1)
        })
        .catch((err) => console.error('Failed to load search suggestions:', err))
    }, DEBOUNCE_MS)
    return () => clearTimeout(debounceTimer.current)
  }, [value])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const goToResults = (query) => {
    if (!query) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const goToProduct = (product) => {
    setOpen(false)
    setValue(product.name)
    navigate(`/product/${product.slug}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex])
      return
    }
    goToResults(value.trim())
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form className="w-full" onSubmit={handleSubmit} role="search" autoComplete="off">
        <div className="relative flex items-center bg-white border border-[#888888] focus-within:border-black rounded-[25px] min-h-[59px] overflow-hidden transition-colors">
          <input
            type="search"
            name="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-[14px] text-black placeholder-[#888888] pl-5 pr-2"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center shrink-0 self-stretch w-[59px] bg-cz-accent text-[#888888] cursor-pointer"
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#dedede] rounded-[14px] shadow-lg z-[60] overflow-hidden">
          {suggestions.map((p, i) => {
            const { price, oldPrice } = getEffectivePrice(p)
            return (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                onClick={() => goToProduct(p)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  activeIndex === i ? 'bg-cz-gold-light' : ''
                }`}
              >
                <img
                  src={resolveImageUrl(p.image)}
                  alt={p.name}
                  className="w-10 h-10 rounded-md object-cover border border-[#f0f0f0] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#212121] truncate">{p.name}</div>
                  {p.category_name && (
                    <div className="text-[11px] text-[#9ca3af]">in {p.category_name}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-medium text-[#212121]">{format(price)}</div>
                  {oldPrice && (
                    <div className="text-[11px] text-[#9ca3af] line-through">{format(oldPrice)}</div>
                  )}
                </div>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => goToResults(value.trim())}
            className="block w-full text-center px-4 py-2.5 text-[13px] font-medium text-cz-primary hover:bg-cz-gold-light border-t border-[#f0f0f0]"
          >
            See all results for &quot;{value.trim()}&quot;
          </button>
        </div>
      )}
    </div>
  )
}
