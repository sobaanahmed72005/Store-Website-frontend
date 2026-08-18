import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, key } = useLocation()
  const navigationType = useNavigationType()
  const scrollMap = useRef(new Map())
  const fullPath = pathname + search

  // Disable browser's native automatic scroll restoration to avoid race conditions with React DOM rendering
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Save current scroll Y position when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop
      if (currentY >= 0) {
        scrollMap.current.set(fullPath, currentY)
        scrollMap.current.set(key, currentY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fullPath, key])

  // Handle route navigation
  useEffect(() => {
    if (navigationType === 'POP') {
      // Back / Forward button pressed: retrieve saved scroll position
      const savedY = scrollMap.current.get(fullPath) ?? scrollMap.current.get(key) ?? 0

      if (savedY > 0) {
        // Retry scroll restoration over the next 400ms while async products & images render into DOM
        let attempts = 0
        const restore = () => {
          window.scrollTo(0, savedY)
          attempts++
          // If the page content hasn't fully expanded to savedY yet, retry every 40ms
          if (attempts < 12 && Math.abs((window.scrollY || document.documentElement.scrollTop) - savedY) > 20) {
            setTimeout(restore, 40)
          }
        }
        requestAnimationFrame(restore)
      } else {
        window.scrollTo(0, 0)
      }
    } else {
      // New link clicked (PUSH): scroll to top of page
      window.scrollTo(0, 0)
    }
  }, [pathname, search, key, navigationType])

  return null
}
