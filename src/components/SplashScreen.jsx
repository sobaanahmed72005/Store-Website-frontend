import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteSettings } from '../store/siteSettingsStore'
import MetallicPaint from './ui/MetallicPaint'

// Helper to generate crisp SVG mask for Alluring font wordmark
function createWordmarkSvg(text) {
  const brand = (text || 'IT SOLUTIONS').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="400" viewBox="0 0 1800 400">
    <rect width="1800" height="400" fill="transparent"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Alluring', 'Cinzel', 'Playfair Display', 'Georgia', serif" font-weight="900" font-size="170" fill="#000000" letter-spacing="10">${brand}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function SplashScreen() {
  const { siteName } = useSiteSettings()
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const brandText = (siteName || 'IT SOLUTIONS').toUpperCase()
  const wordmarkSvg = useMemo(() => createWordmarkSvg(brandText), [brandText])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if user has already opened the site in this browser session
    const isRefresh = sessionStorage.getItem('cz_has_opened_site') === 'true'
    sessionStorage.setItem('cz_has_opened_site', 'true')

    // Initial site open: 7.5s full cinematic sequence (7000ms fade / 7800ms hide)
    // Page refresh / reload: Ultra-fast 1.0s snappy sequence (600ms fade / 1000ms hide)
    const fadeDuration = isRefresh ? 600 : 7000
    const hideDuration = isRefresh ? 1000 : 7800

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, fadeDuration)

    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, hideDuration)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="liquid-metal-paint-splash"
        initial={{ opacity: 1 }}
        animate={{
          opacity: isFadingOut ? 0 : 1,
          scale: isFadingOut ? 1.04 : 1,
          filter: isFadingOut ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden bg-[#030712]"
        style={{
          background: 'radial-gradient(ellipse at center, #0c3e5e 0%, #061324 60%, #030712 100%)',
        }}
      >
        {/* Ambient Dark Cyan Atmosphere Glow */}
        <div className="absolute w-[950px] h-[950px] rounded-full bg-[#00f2fe]/15 blur-[180px] pointer-events-none" />

        {/* Full-Screen MetallicPaint Container: Alluring Font Wordmark */}
        <div className="relative z-10 w-full h-[85vh] sm:h-[90vh] flex items-center justify-center p-2 sm:p-4 max-w-full overflow-hidden">
          
          {/* Instant Frame 0 Alluring Metallic Wordmark SVG (Visible IMMEDIATELY at 0.0s) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="instant-metallic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#00f2fe" />
                <stop offset="75%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="54%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily="'Alluring', 'Cinzel', 'Playfair Display', 'Georgia', serif"
              fontWeight="900"
              fontSize="170"
              fill="url(#instant-metallic-grad)"
              letterSpacing="10"
              filter="drop-shadow(0px 4px 15px rgba(0,242,254,0.6))"
            >
              {brandText}
            </text>
          </svg>

          {/* Live WebGL 2 MetallicPaint Layer */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <MetallicPaint
              imageSrc={wordmarkSvg}
              // Pattern Parameters
              seed={42}
              scale={3.5}
              patternSharpness={1}
              noiseScale={0.5}
              // Animation Flow Parameters
              speed={0.28}
              liquid={0.75}
              mouseAnimation={false}
              // Visual Specs (Smooth React Bits Defaults)
              brightness={2.0}
              contrast={0.5}
              refraction={0.015}
              blur={0.005}
              chromaticSpread={2}
              fresnel={1}
              angle={0}
              waveAmplitude={1}
              distortion={1}
              contour={0.2}
              // Metallic Colors
              lightColor="#ffffff"
              darkColor="#051326"
              tintColor="#00f2fe"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
