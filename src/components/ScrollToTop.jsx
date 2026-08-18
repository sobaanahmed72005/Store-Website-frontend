import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

function ScrollToTop() {
  const { pathname, key } = useLocation()
  const navigationType = useNavigationType()
  const scrollPositions = useRef(new Map())

  // Save exact scroll Y coordinate when scrolling
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current.set(key, window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [key])

  // Handle route change
  useEffect(() => {
    if (navigationType === 'POP') {
      // User pressed Back / Forward button -> restore saved scroll position!
      const savedY = scrollPositions.current.get(key) || 0
      requestAnimationFrame(() => {
        window.scrollTo(0, savedY)
      })
    } else {
      // User navigated forward to a new page -> scroll to top
      window.scrollTo(0, 0)
    }
  }, [pathname, key, navigationType])

  return null
}

export default ScrollToTop
