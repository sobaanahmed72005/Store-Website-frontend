import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './icons'
import { api } from '../api/client'

export default function Hero() {
  const [slides, setSlides] = useState(null)
  const [sideBanners, setSideBanners] = useState([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    api.get('/content/hero-banners')
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
    <section className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
      <div className="flex flex-col md:flex-row gap-5">

        {/* Main slider */}
        {slides?.length > 0 && (
          <div className={`w-full ${sideBanners.length > 0 ? 'md:w-[70%]' : ''}`}>
            <div className="relative rounded-xl overflow-hidden h-[300px] md:h-auto md:aspect-[938/516]">
              {slides.map((slide, i) => (
                <Link
                  key={i}
                  to={slide.href || '/shop'}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title || `Slide ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {(slide.tagline || slide.title || slide.description || slide.cta) && (
                    <div className="absolute inset-0 flex items-end justify-start text-start p-5 pb-10 md:p-[35px] md:pb-12">
                      <div className="flex flex-col items-start w-[70%] md:max-w-[40%]">
                        {slide.tagline && (
                          <span className="text-[15px] font-normal text-[#212121] mb-[5px]">{slide.tagline}</span>
                        )}
                        {slide.title && (
                          <h2 className="text-[18px] md:text-[35px] font-semibold text-[#212121] mb-[10px] leading-tight">
                            {slide.title}
                          </h2>
                        )}
                        {slide.description && (
                          <p className="block text-[14px] font-normal text-[#212121] mb-[10px]">{slide.description}</p>
                        )}
                        {slide.cta && (
                          <span className="inline-flex items-center justify-center gap-[5px] rounded-[5px] bg-cz-primary text-white text-[13px] md:text-[14px] px-4 md:px-5 py-2.5 md:py-3 min-w-[20%]">
                            {slide.cta}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}

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
                      src={banner.image}
                      alt={banner.title || `Banner ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {hasText ? (
                    <div className="absolute inset-0 flex items-center justify-start p-5">
                      <div className="flex flex-col items-start bg-cz-gold-light rounded-xl p-[27px] w-full">
                        {banner.tagline && <span className="text-[15px] text-[#4b4b4b]">{banner.tagline}</span>}
                        {banner.title && <h3 className="text-[20px] font-medium text-[#4b4b4b] mb-[7px]">{banner.title}</h3>}
                        {banner.description && (
                          <p className="text-[11px] text-[#4b4b4b] mb-[11px] leading-snug whitespace-pre-line">
                            {banner.description}
                          </p>
                        )}
                        {banner.cta && (
                          <span className="inline-flex items-center justify-center rounded-[5px] bg-cz-primary text-white text-[13px] px-4 py-2">
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
