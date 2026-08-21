import { useEffect, useState } from 'react'

export function triggerFlyToCart(startRect, imageSrc) {
  const event = new CustomEvent('FLY_TO_CART', {
    detail: { startRect, imageSrc },
  })
  window.dispatchEvent(event)
}

export default function FlyingCartAnimation() {
  const [particles, setParticles] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const handleFly = (e) => {
      const { startRect, imageSrc } = e.detail
      if (!startRect || !imageSrc) return

      // Locate active visible header cart icon target (mobile, tablet, or desktop)
      const cartTargets = Array.from(document.querySelectorAll('.header-cart-target, #header-cart-icon, #header-cart-icon-mobile, [aria-label*="Cart"], [aria-label*="cart"]'))
      const visibleCartElem = cartTargets.find((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && r.top >= 0
      }) || cartTargets[0]

      const targetRect = visibleCartElem
        ? visibleCartElem.getBoundingClientRect()
        : { left: window.innerWidth - 60, top: 15, width: 36, height: 36 }

      const id = Date.now() + Math.random()

      const startX = startRect.left + startRect.width / 2 - 24
      const startY = startRect.top + startRect.height / 2 - 24

      const targetX = targetRect.left + targetRect.width / 2 - 16
      const targetY = targetRect.top + targetRect.height / 2 - 16

      const particle = {
        id,
        imageSrc,
        startX,
        startY,
        targetX,
        targetY,
      }

      setParticles((prev) => [...prev, particle])

      // After 1400ms (flying lands smoothly on cart icon)
      setTimeout(() => {
        // Remove particle
        setParticles((prev) => prev.filter((p) => p.id !== id))

        // Pulse cart icon element
        if (visibleCartElem) {
          visibleCartElem.classList.add('animate-bounce-short')
          setTimeout(() => visibleCartElem.classList.remove('animate-bounce-short'), 600)
        }

        // Show sleek Toast Pill notification
        setToast({
          id,
          x: Math.min(targetX, window.innerWidth - 180),
          y: Math.max(targetY + 45, 60),
        })
      }, 1400)
    }

    window.addEventListener('FLY_TO_CART', handleFly)
    return () => window.removeEventListener('FLY_TO_CART', handleFly)
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 2200)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Flying Product Thumbnail */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            '--start-x': `${p.startX}px`,
            '--start-y': `${p.startY}px`,
            '--target-x': `${p.targetX}px`,
            '--target-y': `${p.targetY}px`,
          }}
          className="absolute w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-400 bg-white shadow-2xl shadow-cyan-500/60 animate-fly-arc"
        >
          <img src={p.imageSrc} alt="" className="w-full h-full object-contain p-1.5" />
        </div>
      ))}

      {/* Sleek Added-to-Cart Toast Notification Pill */}
      {toast && (
        <div
          style={{
            top: `${toast.y}px`,
            left: `${toast.x}px`,
          }}
          className="absolute -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl border border-cyan-500/40 flex items-center gap-2 animate-toastPop pointer-events-none"
        >
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
            ✓
          </span>
          <span>Added to cart</span>
        </div>
      )}
    </div>
  )
}
