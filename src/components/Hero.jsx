import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

const SLIDE_THEMES = [
  { tagline: '#0ea5e9', ctaBg: '#0ea5e9' }, // Cyan / Sky Blue
  { tagline: '#2563eb', ctaBg: '#2563eb' }, // Royal Blue
  { tagline: '#16a34a', ctaBg: '#16a34a' }, // Smart Green
  { tagline: '#7c3aed', ctaBg: '#7c3aed' }, // Purple
  { tagline: '#ea580c', ctaBg: '#ea580c' }, // Orange / Amber
  { tagline: '#0d9488', ctaBg: '#0d9488' }, // Teal
]

export default function Hero() {
  const [slides, setSlides] = useState(null)
  const [active, setActive] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    api.get(ENDPOINTS.CONTENT.HERO_BANNERS)
      .then((data) => {
        const mainSlides = (data.slides || []).filter((s) => s.active !== false && s.image)
        const sideBanners = (data.sideBanners || []).filter((b) => b.active !== false && b.image)
        const combined = [...mainSlides, ...sideBanners]
        setSlides(combined)
      })
      .catch(() => setSlides([]))
  }, [])

  useEffect(() => { setActive(0) }, [slides])

  // Auto cycle slides every 5 seconds
  useEffect(() => {
    if (!slides?.length || slides.length <= 1) return
    const id = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % slides.length
        if (trackRef.current) {
          const width = trackRef.current.clientWidth
          trackRef.current.scrollTo({ left: next * width, behavior: 'smooth' })
        }
        return next
      })
    }, 5000)
    return () => clearInterval(id)
  }, [slides])

  // Track swipe / scroll position to update active dot
  const handleScroll = () => {
    if (!trackRef.current) return
    const width = trackRef.current.clientWidth
    if (width > 0) {
      const newActive = Math.round(trackRef.current.scrollLeft / width)
      if (newActive !== active && newActive >= 0 && newActive < (slides?.length || 0)) {
        setActive(newActive)
      }
    }
  }

  const scrollToSlide = (idx) => {
    setActive(idx)
    if (trackRef.current) {
      const width = trackRef.current.clientWidth
      trackRef.current.scrollTo({ left: idx * width, behavior: 'smooth' })
    }
  }

  if (!slides?.length) return null

  return (
    <section className="mx-auto px-5 py-5">
      <div className="relative w-full">
        {/* Swipeable & Scrollable Horizontal Track */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory rounded-2xl bg-[#f8fafc] shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => {
            const theme = SLIDE_THEMES[i % SLIDE_THEMES.length]
            const ctaBg = slide.ctaBg || slide.color || theme.ctaBg

            return (
              <div
                key={i}
                className="w-full shrink-0 snap-center relative aspect-[16/9] sm:aspect-[2.2/1] md:aspect-[2.4/1] overflow-hidden"
              >
                <Link
                  to={slide.href || '/shop'}
                  className="block w-full h-full relative"
                >
                  <img
                    src={resolveImageUrl(slide.image)}
                    alt={slide.title || `Banner ${i + 1}`}
                    width={1200}
                    height={500}
                    className="w-full h-full object-cover select-none"
                  />
                  {slide.cta && (
                    <div className="absolute inset-0 flex items-end justify-start p-4 sm:p-6 md:p-10 pointer-events-none">
                      <span
                        className="inline-flex items-center justify-center rounded-full text-white text-[11px] sm:text-[13px] md:text-[14px] font-semibold px-4 sm:px-6 py-1.5 sm:py-2.5 shadow-md transition-all hover:scale-105"
                        style={{ backgroundColor: ctaBg }}
                      >
                        {slide.cta}
                      </span>
                    </div>
                  )}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Pagination Indicators (Dots) */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollToSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === active ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
