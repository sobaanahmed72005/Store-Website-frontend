import { useState, useEffect } from 'react'
import { useSiteSettings } from '../store/siteSettingsStore'

// Helper to split store name into styled parts (e.g. "IT" "SOLUTIONS")
function splitBrandName(name) {
  if (!name) return ['IT', 'SOLUTIONS']
  const spaceIndex = name.indexOf(' ')
  if (spaceIndex > 0) return [name.slice(0, spaceIndex), name.slice(spaceIndex + 1)]
  return [name, '']
}

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const { siteName, logoUrl } = useSiteSettings()

  const [firstPart, secondPart] = splitBrandName(siteName)
  const logoImageSource = logoUrl || '/logo-new.png'

  useEffect(() => {
    // Show splash on fresh page load or reload
    const timer1 = setTimeout(() => {
      setIsFadingOut(true)
    }, 1000) // 1.0s display duration

    const timer2 = setTimeout(() => {
      setIsVisible(false)
    }, 1350) // 350ms fade-out transition duration

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
      <div className="absolute w-[320px] h-[320px] rounded-full bg-[#38bdf8]/15 blur-3xl animate-pulse" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Dynamic Logo Image or Brand Icon Mark */}
        <div className="relative mb-5 transform transition-transform duration-700 animate-bounce-subtle flex items-center justify-center">
          <div className="absolute -inset-3 bg-gradient-to-r from-[#0891b2] via-[#38bdf8] to-[#bf9a33] rounded-full blur-md opacity-70 animate-pulse" />

          {!imgFailed ? (
            <img
              src={logoImageSource}
              alt={siteName || 'IT SOLUTIONS'}
              onError={() => setImgFailed(true)}
              className="relative h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]"
            />
          ) : (
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#0c4a6e] to-[#030b13] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] font-extrabold text-2xl md:text-3xl shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              IT
            </div>
          )}
        </div>

        {/* Brand Name Typography */}
        <div className="flex items-center gap-2 font-heading font-extrabold text-3xl md:text-5xl tracking-tight mb-2">
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
        <p className="text-[11px] md:text-[13px] tracking-[0.3em] font-medium uppercase text-[#94a3b8] mb-6">
          Trade &amp; Service Pvt. Ltd.
        </p>

        {/* Shimmer Progress Line */}
        <div className="w-36 md:w-48 h-[3px] bg-[#1e293b] rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#0891b2] via-[#38bdf8] to-[#bf9a33] rounded-full"
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
