import { useEffect, useState } from 'react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    // Check if user is in standalone mode already
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // Check if prompt has already been shown/dismissed in local storage (shows ONLY once ever)
    const hasBeenShown =
      localStorage.getItem('pwa_prompt_shown') === 'true' ||
      localStorage.getItem('pwa_prompt_dismissed') === 'true' ||
      sessionStorage.getItem('pwa_prompt_dismissed') === 'true'

    if (hasBeenShown) return

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream
    if (iosDevice) setIsIos(true)

    // Show banner on first open only, and immediately mark as shown so reloads won't trigger it again
    setIsVisible(true)
    localStorage.setItem('pwa_prompt_shown', 'true')

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    } else if (isIos) {
      alert('To install IT Solutions App on iPhone:\n\n1. Tap the Share button at the bottom of Safari\n2. Scroll down and select "Add to Home Screen"')
    } else {
      alert('To install IT Solutions App:\n\n1. Tap the 3 dots (⋮) in the top-right corner of Chrome\n2. Select "Add to Home screen" or "Install app"')
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md bg-[#0f172a] text-white p-4 rounded-xl shadow-2xl border border-sky-500/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-cz-primary shrink-0 flex items-center justify-center font-bold text-white text-lg shadow-md">
          IT
        </div>
        <div className="min-w-0">
          <h4 className="text-[14px] font-semibold text-white truncate">Install IT Solutions App</h4>
          <p className="text-[12px] text-gray-300 leading-tight">
            Faster shopping & instant tracking on your home screen!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors shadow"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white text-lg px-1.5 py-0.5"
          aria-label="Close app prompt"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
