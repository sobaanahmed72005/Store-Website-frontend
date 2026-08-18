import { useState, useEffect } from 'react'
import { useSiteSettings } from '../store/siteSettingsStore'

// Helper to split store name into styled parts (e.g. "IT" "SOLUTIONS")
function splitBrandName(name) {
  const brandName = name || 'IT SOLUTIONS'
  const spaceIndex = brandName.indexOf(' ')
  if (spaceIndex > 0) return [brandName.slice(0, spaceIndex), brandName.slice(spaceIndex + 1)]
  return [brandName, '']
}

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const { siteName, logoUrl } = useSiteSettings()

  const [firstPart, secondPart] = splitBrandName(siteName)

  // Synchronously fetch cached logo URL if store state is initializing
  const cachedLogo = typeof window !== 'undefined' ? localStorage.getItem('itsolutions_cached_logo') : null
  const activeLogo = logoUrl || cachedLogo

  useEffect(() => {
    // Show splash for exactly 1.0s, then fade out
    const timer1 = setTimeout(() => {
      setIsFadingOut(true)
    }, 1000)

    const timer2 = setTimeout(() => {
      setIsVisible(false)
    }, 1350)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#061524] text-white select-none transition-all duration-350 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, #0c4a6e 0%, #061524 70%, #030b13 100%)',
      }}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute w-[340px] h-[340px] rounded-full bg-[#38bdf8]/15 blur-3xl animate-pulse" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Animated Brand Mark / Cached Logo Container */}
        <div className="relative mb-6 transform transition-transform duration-700 animate-bounce-subtle flex items-center justify-center min-h-[90px]">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#0891b2] via-[#38bdf8] to-[#0c4a6e] rounded-full blur-lg opacity-60 animate-pulse" />

          {activeLogo ? (
            <img
              src={activeLogo}
              alt={siteName || 'IT SOLUTIONS'}
              className="relative h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]"
            />
          ) : (
            <div className="relative flex items-center justify-center p-2">
              <svg
                className="w-16 h-16 md:w-20 md:h-20 text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 12h20" stroke="currentColor" strokeWidth="1.2" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>

        {/* Brand Name Typography */}
        <div className="flex items-center gap-2.5 font-heading font-extrabold text-3xl md:text-5xl tracking-tight mb-2">
          <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            {firstPart}
          </span>
          {secondPart && (
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#0891b2] to-[#38bdf8] bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]">
              {secondPart}
            </span>
          )}
        </div>

        {/* Subtitle / Company Name */}
        <p className="text-[11px] md:text-[13px] tracking-[0.3em] font-semibold uppercase text-[#94a3b8] mb-6">
          Trade &amp; Service Pvt. Ltd.
        </p>

        {/* Shimmer Progress Line */}
        <div className="w-40 md:w-52 h-[3px] bg-[#1e293b] rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#0891b2] via-[#38bdf8] to-[#0c4a6e] rounded-full"
            style={{
              animation: 'splashProgress 1.0s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.03); }
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
