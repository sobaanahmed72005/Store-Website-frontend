import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../store/categoryStore'
import { resolveImageUrl } from '../api/client'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

function categorySlugToPath(slug) {
  return slug === 'laptops' ? '/laptops' : `/category/${slug}`
}

export default function CategoryIcons() {
  const { iconCategories } = useCategories()
  const categories = iconCategories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))

  const trackRef = useRef(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [active, setActive] = useState(0)

  // Drag to scroll state for mouse / touch
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)

  const checkOverflowAndScroll = () => {
    const el = trackRef.current
    if (!el) return
    const overflow = el.scrollWidth > el.clientWidth + 5
    setHasOverflow(overflow)
    setCanScrollLeft(el.scrollLeft > 5)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
  }

  useEffect(() => {
    checkOverflowAndScroll()
    window.addEventListener('resize', checkOverflowAndScroll)
    return () => window.removeEventListener('resize', checkOverflowAndScroll)
  }, [categories])

  useEffect(() => {
    if (!hasOverflow || categories.length === 0) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % categories.length)
    }, 4000)
    return () => clearInterval(id)
  }, [hasOverflow, categories.length])

  useEffect(() => {
    if (!hasOverflow) return
    const el = trackRef.current
    if (!el) return
    const child = el.children[active]
    if (child) {
      const scrollLeft = child.offsetLeft - (el.clientWidth / 2 - child.clientWidth / 2)
      el.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' })
    }
  }, [active, hasOverflow])

  const scrollByAmount = (direction) => {
    const el = trackRef.current
    if (!el) return
    const amount = direction === 'left' ? -280 : 280
    el.scrollBy({ left: amount, behavior: 'smooth' })
    setTimeout(checkOverflowAndScroll, 350)
  }

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeftStart.current = trackRef.current.scrollLeft
  }

  const handleMouseLeave = () => {
    isDragging.current = false
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault()
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    trackRef.current.scrollLeft = scrollLeftStart.current - walk
    checkOverflowAndScroll()
  }

  if (categories.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative group/section">
        {/* Navigation Arrows for desktop — ONLY show on section hover when overflowing */}
        {hasOverflow && canScrollLeft && (
          <button
            onClick={() => scrollByAmount('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md border border-slate-200 hidden sm:flex items-center justify-center text-slate-700 hover:bg-white hover:text-cz-primary transition-all duration-300 opacity-0 group-hover/section:opacity-100 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}

        {hasOverflow && canScrollRight && (
          <button
            onClick={() => scrollByAmount('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md border border-slate-200 hidden sm:flex items-center justify-center text-slate-700 hover:bg-white hover:text-cz-primary transition-all duration-300 opacity-0 group-hover/section:opacity-100 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}

        {/* Categories Track (Native touch swipe + Mouse drag support) */}
        <div
          ref={trackRef}
          onScroll={checkOverflowAndScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex flex-nowrap gap-3 sm:gap-5 md:gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 select-none touch-pan-x ${
            hasOverflow ? 'justify-start' : 'justify-center'
          }`}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={categorySlugToPath(cat.slug)}
              className="group/item flex flex-col items-center shrink-0 w-[105px] sm:w-[125px] md:w-[140px] lg:w-[150px] transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="aspect-square w-full rounded-full overflow-hidden cursor-pointer bg-cz-gold-light border-2 border-transparent group-hover/item:border-cz-primary group-hover/item:shadow-lg group-hover/item:shadow-cyan-500/10 transition-all duration-300 p-1 sm:p-1.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  {cat.image ? (
                    <img
                      src={resolveImageUrl(cat.image)}
                      alt={cat.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      {cat.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-slate-800 text-center mt-2.5 line-clamp-2 cursor-pointer group-hover/item:text-cz-primary transition-colors leading-tight">
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination Dots (Only show when content actually overflows) */}
      {hasOverflow && (
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {categories.map((cat, i) => (
            <button
              key={cat.slug}
              onClick={() => setActive(i)}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              style={{
                backgroundColor: i === active ? '#0ea5e9' : '#cbd5e1',
                width: i === active ? '16px' : '8px',
              }}
              aria-label={`Go to ${cat.name}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}



