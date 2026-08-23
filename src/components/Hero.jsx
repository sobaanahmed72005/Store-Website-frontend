import { useEffect, useState } from 'react'
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

  useEffect(() => {
    setActive(0)
  }, [slides])

  useEffect(() => {
    if (!slides?.length || slides.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides])

  if (!slides?.length) return null

  const prevSlide = () => {
    setActive((i) => (i - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setActive((i) => (i + 1) % slides.length)
  }

  return (
    <section className="mx-auto px-5 py-5">
      <div className="w-full">
        {/* Full-width Hero Carousel */}
        <div className="group relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[2.2/1] md:aspect-[2.4/1] bg-[#f8fafc] shadow-sm">
          {slides.map((slide, i) => {
            const theme = SLIDE_THEMES[i % SLIDE_THEMES.length]
            const ctaBg = slide.ctaBg || slide.color || theme.ctaBg

            return (
              <Link
                key={i}
                to={slide.href || '/shop'}
                className={`absolute inset-0 transition-opacity duration-500 block ${
                  i === active ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={resolveImageUrl(slide.image)}
                  alt={slide.title || `Banner ${i + 1}`}
                  width={1200}
                  height={500}
                  className="w-full h-full object-cover"
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
            )
          })}

          {/* Left Arrow Button */}
          {slides.length > 1 && (
            <button
              type="button"
              aria-label="Previous Slide"
              onClick={prevSlide}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Right Arrow Button */}
          {slides.length > 1 && (
            <button
              type="button"
              aria-label="Next Slide"
              onClick={nextSlide}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          {/* Pagination Indicators (Dots) */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === active ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
