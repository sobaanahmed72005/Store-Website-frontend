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
            <div className="relative rounded-xl overflow-hidden h-[300px] md:h-auto md:aspect-[938/516]">
              {slides.map((slide, i) => {
                const theme = SLIDE_THEMES[i % SLIDE_THEMES.length]
                const accentColor = slide.taglineColor || slide.color || theme.tagline
                const ctaBg = slide.ctaBg || slide.color || theme.ctaBg

                return (
                  <Link
                    key={i}
                    to={slide.href || '/shop'}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <img
                      src={resolveImageUrl(slide.image)}
                      alt={slide.title || `Slide ${i + 1}`}
                      width={938}
                      height={516}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {(slide.tagline || slide.title || slide.description || slide.cta) && (
                      <div className="absolute inset-0 flex items-center justify-start text-start p-6 md:px-12 pt-8 md:pt-14 pb-6">
                        <div className="flex flex-col items-start max-w-[90%] sm:max-w-[65%] md:max-w-[50%] mt-3 md:mt-5">
                          {slide.tagline && (
                            <span
                              className="text-[13px] md:text-[15px] font-semibold mb-1.5"
                              style={{ color: accentColor }}
                            >
                              {slide.tagline}
                            </span>
                          )}
                          {slide.title && (
                            <h2 className="text-[22px] sm:text-[28px] md:text-[36px] font-bold text-[#0f172a] mb-2.5 leading-[1.15] whitespace-pre-line">
                              {slide.title}
                            </h2>
                          )}
                          {slide.description && (
                            <p className="block text-[12px] sm:text-[13px] md:text-[14px] font-normal text-[#475569] mb-4 leading-relaxed max-w-[420px]">
                              {slide.description}
                            </p>
                          )}
                          {slide.cta && (
                            <span
                              className="inline-flex items-center justify-center rounded-full text-white text-[13px] md:text-[14px] font-medium px-5 md:px-6 py-2 md:py-2.5 shadow-sm transition-all hover:brightness-110"
                              style={{ backgroundColor: ctaBg }}
                            >
                              {slide.cta}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                )
              })}

              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setActive(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === active ? 'w-6 bg-white' : 'w-2 bg-white/60'
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
          <div className={`w-full ${slides?.length > 0 ? 'md:w-[30%]' : ''} flex flex-col gap-5`}>
            {sideBanners.slice(0, 2).map((banner, i) => {
              const hasText = banner.title || banner.tagline || banner.description
              return (
                <Link
                  key={i}
                  to={banner.href || '/shop'}
                  className="relative flex-1 rounded-xl overflow-hidden h-[150px] md:h-auto"
                >
                  {banner.image && (
                    <img
                      src={resolveImageUrl(banner.image)}
                      alt={banner.title || `Banner ${i + 1}`}
                      width={400}
                      height={300}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {hasText ? (
                    <div className="absolute inset-0 flex items-center justify-start p-4">
                      <div className="flex flex-col items-start bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl p-5 w-full shadow-md">
                        {banner.tagline && <span className="text-[12px] font-bold text-cz-primary tracking-wide uppercase mb-1">{banner.tagline}</span>}
                        {banner.title && <h3 className="text-[18px] font-bold text-slate-800 mb-1.5 leading-snug">{banner.title}</h3>}
                        {banner.description && (
                          <p className="text-[12px] text-slate-600 mb-3 leading-relaxed whitespace-pre-line">
                            {banner.description}
                          </p>
                        )}
                        {banner.cta && (
                          <span className="inline-flex items-center justify-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[12px] font-bold px-4 py-1.5 transition-all shadow-sm">
                            {banner.cta}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    banner.cta && (
                      <div className="absolute inset-0 flex items-end justify-start p-[17px]">
                        <span className="inline-flex items-center justify-center gap-1 rounded-[5px] bg-cz-primary text-white text-[13px] px-4 py-2">
                          {banner.cta}
                          <ChevronRightIcon size={16} />
                        </span>
                      </div>
                    )
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
