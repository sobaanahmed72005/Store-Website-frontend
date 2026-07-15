import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../store/siteSettingsStore'

const NAV_LINKS = [
  { label: 'About us',      href: '/about-us' },
  { label: 'Contact us',    href: '/contact' },
  { label: 'Policies',      href: '/return-exchange' },
  { label: 'Order tracking', href: '/account' },
]

const DEFAULT_MESSAGES = [
  'We operate only one official store.',
  'Prices may vary due to currency changes.',
  'Beware of fake stores claiming our name.',
]

export default function Navbar() {
  const { siteName, brand } = useSiteSettings()
  const messages = brand.marqueeMessages?.length > 0 ? brand.marqueeMessages : DEFAULT_MESSAGES
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % messages.length), 4000)
    return () => clearInterval(id)
  }, [messages])

  return (
    <div className="bg-cz-topbar text-white text-[13px] py-2.5">
      <div className="mx-auto px-5 flex flex-col gap-1.5 lg:grid lg:grid-cols-3 lg:items-center lg:gap-2">

        {/* Rotating messages — edit from Admin → Footer / Store Info → Marquee Messages */}
        <div className="lg:col-span-1 text-center lg:text-left overflow-hidden relative h-[18px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${(i - active) * 100}%)` }}
            >
              <p>{msg}</p>
            </div>
          ))}
        </div>

        {/* Top nav links — wraps and stays right-aligned on narrow screens instead of disappearing */}
        <div className="flex flex-wrap justify-end lg:col-span-2 items-center gap-x-[10px] gap-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="hover:text-cz-accent-hover transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}