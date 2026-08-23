import { useEffect, useState, useRef } from 'react'
import MirageHeroCanvas from './3d/MirageHeroCanvas'
import HeroBannerCarousel from './HeroBannerCarousel'
import Header from './Header'

export default function Hero() {
  const containerRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalScrollable = containerRef.current.clientHeight - window.innerHeight
      if (totalScrollable > 0) {
        const scrolled = -rect.top
        const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1)
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const textOpacity = Math.max(1 - scrollProgress * 3.3, 0)
  const textScale = 1 - scrollProgress * 0.15
  const textTranslateY = scrollProgress * 60

  const showBanners = scrollProgress >= 0.60

  return (
    <section ref={containerRef} className="relative w-full h-[320vh] bg-[#03070A] text-white selection:bg-[#0891B2] selection:text-white">
      {/* Sticky Viewport Pinned in Place during 3D video scroll & banner showcase */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between">
        {/* Fast & Smooth Scroll-Scrubbed Video Background */}
        <MirageHeroCanvas progress={scrollProgress} />

        {/* Floating Store Header */}
        <div className="relative z-20 w-full bg-transparent">
          <Header transparent />
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-[#0891B2]/20 via-[#0A2028]/10 to-transparent blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-12 flex-1 flex flex-col justify-center w-full pointer-events-none">
          {/* Phase 1: Intro Headline */}
          {textOpacity > 0.01 && (
            <div
              className="max-w-2xl text-left transition-all duration-75 ease-out pointer-events-auto"
              style={{
                opacity: textOpacity,
                transform: `scale(${textScale}) translateY(${textTranslateY}px)`,
              }}
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight leading-[1.08] text-white drop-shadow-sm">
                POWERING YOUR <br />
                <span className="bg-gradient-to-r from-white via-[#22D3EE] to-[#0891B2] bg-clip-text text-transparent">
                  DIGITAL WORLD
                </span>
              </h1>
            </div>
          )}

          {/* Phase 2: Hero Banners Showcase */}
          <HeroBannerCarousel visible={showBanners} />
        </div>
      </div>
    </section>
  )
}
