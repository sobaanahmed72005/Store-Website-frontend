import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './icons'
import { api, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

const SLIDE_THEMES = [
  { tagline: '#0ea5e9', ctaBg: '#0ea5e9' }, // Slide 1: Cyan / Sky Blue
  { tagline: '#2563eb', ctaBg: '#2563eb' }, // Slide 2: Royal Blue
  { tagline: '#16a34a', ctaBg: '#16a34a' }, // Slide 3: Smart Green
  { tagline: '#7c3aed', ctaBg: '#7c3aed' }, // Slide 4: Purple
]

const SIDE_BANNER_THEMES = [
  { tagline: '#ea580c', ctaBg: '#ea580c' }, // Side Banner 1: Orange (Mobile Accessories)
  { tagline: '#0d9488', ctaBg: '#0d9488' }, // Side Banner 2: Teal (Complete IT Solutions)
]

export default function Hero() {
  const [slides, setSlides] = useState(null)
  const [sideBanners, setSideBanners] = useState([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    api.get(ENDPOINTS.CONTENT.HERO_BANNERS)
      .then((data) => {
        const activeSlides = (data.slides || []).filter((s) => s.active !== false && s.image)
        setSlides(activeSlides)
        setSideBanners((data.sideBanners || []).filter((b) => b.active !== false))
      })
      .catch(() => setSlides([]))
  }, [])

  useEffect(() => { setActive(0) }, [slides])

  useEffect(() => {
    if (!slides?.length || slides.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides])

  if (!slides?.length && !sideBanners.length) return null

  return (
    <section className="mx-auto px-5 py-5">
      <div className="flex flex-col md:flex-row gap-5">

        {/* Main slider */}
        {slides?.length > 0 && (
          <div className={`w-full ${sideBanners.length > 0 ? 'md:w-[70%]' : ''}`}>
            <div className="relative rounded-xl overflow-hidden aspect-[938/516] sm:aspect-[938/516] bg-[#f8fafc]">
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
                      alt={slide.title || `Slide ${i + 1}`}
                      width={938}
                      height={516}
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

              {slides.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setActive(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === active ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Side banners */}
        {sideBanners.length > 0 && (
          <div className={`w-full ${slides?.length > 0 ? 'md:w-[30%]' : ''} flex flex-col gap-4 sm:gap-5`}>
            {sideBanners.slice(0, 2).map((banner, i) => {
              const sideTheme = SIDE_BANNER_THEMES[i % SIDE_BANNER_THEMES.length]
              const ctaBg = banner.ctaBg || banner.color || sideTheme.ctaBg

              return (
                <Link
                  key={i}
                  to={banner.href || '/shop'}
                  className="relative flex-1 rounded-xl overflow-hidden aspect-[400/250] md:aspect-auto block bg-[#f8fafc] group"
                >
                  {banner.image && (
                    <img
                      src={resolveImageUrl(banner.image)}
                      alt={banner.title || `Banner ${i + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {banner.cta && (
                    <div className="absolute inset-0 flex items-end justify-start p-3 sm:p-5 pointer-events-none">
                      <span
                        className="inline-flex items-center justify-center rounded-full text-white text-[10px] sm:text-[12px] font-semibold px-3.5 sm:px-4 py-1 sm:py-1.5 shadow-md transition-all group-hover:scale-105"
                        style={{ backgroundColor: ctaBg }}
                      >
                        {banner.cta}
                      </span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
