import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'
import { useBrandStore } from '../store/brandStore'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export default function HomeBrandsChipsCarousel() {
  const storeBrands = useBrandStore((s) => s.brands)
  const syncProductBrands = useBrandStore((s) => s.syncProductBrands)
  const containerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    api.get(ENDPOINTS.PRODUCTS.BRANDS)
      .then((dbBrands) => {
        if (Array.isArray(dbBrands) && dbBrands.length > 0) {
          syncProductBrands(dbBrands)
        }
      })
      .catch((err) => console.error('Failed to sync catalog brands:', err))
  }, [])

  const checkScroll = () => {
    const el = containerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 5)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [storeBrands])

  const scroll = (direction) => {
    const el = containerRef.current
    if (!el) return
    const amount = direction === 'left' ? -280 : 280
    el.scrollBy({ left: amount, behavior: 'smooth' })
    setTimeout(checkScroll, 300)
  }

  if (!storeBrands || storeBrands.length === 0) return null

  return (
    <section className="mx-auto px-5 pt-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#0c4a6e] font-heading tracking-tight">
          Browse By Brand
        </h2>
        <Link
          to="/shop"
          className="text-[13px] font-semibold text-[#0c4a6e] font-heading hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="relative flex items-center group">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute -left-3.5 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-[#0c4a6e] hover:bg-slate-50 items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeftIcon size={20} />
          </button>
        )}

        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 px-1 w-full scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {storeBrands.map((brand) => (
            <Link
              key={brand.id || brand.title}
              to={`/shop?brand=${encodeURIComponent(brand.title)}`}
              className="shrink-0 group/chip bg-white border border-slate-200/90 rounded-full px-5 py-2.5 shadow-sm hover:border-[#0c4a6e] hover:shadow-md transition-all hover:scale-105 flex items-center gap-2.5 cursor-pointer"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.title}
                  className="w-5 h-5 object-contain grayscale group-hover/chip:grayscale-0 transition-all"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <span className="w-5 h-5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0c4a6e] text-[11px] font-bold flex items-center justify-center font-heading">
                  {brand.title.charAt(0)}
                </span>
              )}
              <span className="text-[14px] font-bold text-slate-800 font-heading group-hover/chip:text-[#0c4a6e] transition-colors">
                {brand.title}
              </span>
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute -right-3.5 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-700 hover:text-[#0c4a6e] hover:bg-slate-50 items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRightIcon size={20} />
          </button>
        )}
      </div>
    </section>
  )
}
