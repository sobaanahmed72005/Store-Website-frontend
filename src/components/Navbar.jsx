import { useEffect, useState } from 'react'
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
    <div className="bg-cz-topbar text-[var(--cz-topbar-text)] text-[13px] py-2">
      <div className="mx-auto px-5 flex items-center justify-center">
        {/* Rotating marquee messages centered cleanly */}
        <div className="w-full text-center overflow-hidden relative h-[18px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-transform duration-500 ease-in-out flex items-center justify-center"
              style={{ transform: `translateX(${(i - active) * 100}%)` }}
            >
              <p className="font-medium tracking-wide">{msg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}