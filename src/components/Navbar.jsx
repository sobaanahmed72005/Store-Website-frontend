import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../store/siteSettingsStore'

const DEFAULT_MESSAGES = [
  'We operate only one official store.',
  'Prices may vary due to currency changes.',
  'Beware of fake stores claiming our name.',
]

export default function Navbar() {
  const { brand } = useSiteSettings()
  const messages = brand.marqueeMessages?.length > 0 ? brand.marqueeMessages : DEFAULT_MESSAGES
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % messages.length), 4000)
    return () => clearInterval(id)
  }, [messages])

  return (
    <div className="bg-cz-topbar text-[var(--cz-topbar-text)] text-[12px] sm:text-[13px] py-1.5 border-b border-slate-700/20 overflow-hidden">
      <div className="mx-auto px-5 flex items-center justify-between gap-4">
        {/* Rotating marquee messages centered cleanly */}
        <div className="flex-1 text-center overflow-hidden relative h-[18px] min-w-0">
          {messages.map((msg, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-transform duration-500 ease-in-out flex items-center justify-center"
              style={{ transform: `translateX(${(i - active) * 100}%)` }}
            >
              <p className="font-medium tracking-wide truncate px-2">{msg}</p>
            </div>
          ))}
        </div>

        {/* Most Right side: Order Tracking Link */}
        <Link
          to="/order-tracking"
          className="shrink-0 text-[13px] font-medium text-[var(--cz-topbar-text)] hover:text-cz-gold transition-colors cursor-pointer"
        >
          Order Tracking
        </Link>
      </div>
    </div>
  )
}