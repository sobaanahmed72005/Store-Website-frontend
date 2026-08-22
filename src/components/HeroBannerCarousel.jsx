import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

const DEFAULT_SLIDES = [
  {
    tagline: 'NEXT-GEN PERFORMANCE',
    title: 'New M3 Max MacBooks & Gaming Rigs',
    description: 'Upgrade your setup with Pakistan’s most trusted computer store. Unbeatable prices & nationwide fast delivery.',
    cta: 'Shop Laptops Now',
    href: '/products?category=laptops',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
  },
  {
    tagline: 'PRO GAMING GEAR',
    title: 'Ultimate Esports Mice & Keyboards',
    description: 'Precision, speed, and durability. Experience high refresh rate monitors and RGB gear.',
    cta: 'Explore Gaming Gear',
    href: '/products?category=gaming',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&auto=format&fit=crop&q=80',
  },
  {
    tagline: 'ENTERPRISE & HOME NETWORKING',
    title: 'Wi-Fi 6 Routers & Security Systems',
    description: 'High-speed internet solutions & 4K CCTV security bundles for home and business.',
    cta: 'View Networking',
    href: '/products?category=networking',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1400&auto=format&fit=crop&q=80',
  },
]

export default function HeroBannerCarousel({ visible = false }) {
  const [slides, setSlides] = useState(DEFAULT_SLIDES)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    api.get(ENDPOINTS.CONTENT.HERO_BANNERS)
      .then((data) => {
        if (Array.isArray(data.slides) && data.slides.length > 0) {
          const activeSlides = data.slides.filter((s) => s.active !== false)
          if (activeSlides.length > 0) {
            setSlides(activeSlides)
          }
        }
      })
      .catch(() => {})
  }, [])

  // Auto-play interval when visible
  useEffect(() => {
    if (!visible || slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [visible, slides.length])

  if (!slides || slides.length === 0) return null

  const currentSlide = slides[currentIndex] || slides[0]

  return (
    <div
      className={`w-full max-w-6xl mx-auto px-4 transition-all duration-700 ease-out pointer-events-auto ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl overflow-hidden bg-[#06141A]/80 border border-[#0891B2]/40 backdrop-blur-xl shadow-2xl shadow-[#0891B2]/20">
        {/* Banner Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center transition-all duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03070A] via-[#03070A]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03070A] via-transparent to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-2xl text-left">
          {currentSlide.tagline && (
            <span className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-bold tracking-widest text-[#22D3EE] bg-[#0891B2]/20 border border-[#0891B2]/40 uppercase font-mono">
              {currentSlide.tagline}
            </span>
          )}

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white leading-tight mb-4 drop-shadow-md">
            {currentSlide.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-xl leading-relaxed">
            {currentSlide.description}
          </p>

          {currentSlide.cta && (
            <Link
              to={currentSlide.href || '/products'}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0891B2] to-[#0284C7] hover:from-[#06b6d4] hover:to-[#0369a1] shadow-lg shadow-[#0891B2]/30 hover:shadow-[#0891B2]/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {currentSlide.cta} →
            </Link>
          )}
        </div>

        {/* Slider Navigation Controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="p-2 rounded-full bg-[#03070A]/70 text-white hover:bg-[#0891B2] border border-white/10 transition-all cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? 'w-6 bg-[#22D3EE]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-full bg-[#03070A]/70 text-white hover:bg-[#0891B2] border border-white/10 transition-all cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
