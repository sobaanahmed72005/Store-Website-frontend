import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { api } from '../api/client'

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
  const { siteName } = useSiteSettings()
  const [messages, setMessages] = useState(DEFAULT_MESSAGES)
  const [active, setActive] = useState(0)

  useEffect(() => {
    api
      .get('/content/footer-brand')
      .then((data) => {
        if (data.marqueeMessages?.length > 0) setMessages(data.marqueeMessages)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % messages.length), 4000)
    return () => clearInterval(id)
  }, [messages])

  return (
    <div className="bg-cz-topbar text-white text-[13px] py-2.5">
      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 grid grid-cols-1 lg:grid-cols-3 items-center gap-2">

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

        {/* Top-right nav links */}
        <div className="hidden lg:flex col-span-2 justify-end items-center gap-[10px]">
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