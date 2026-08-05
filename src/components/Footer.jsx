import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LocationIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  WhatsappIcon,
  TiktokIcon,
  ChevronDownIcon,
} from './icons'
import SiteLink from './SiteLink'
import Logo from './Logo'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSiteSettings } from '../store/siteSettingsStore'
import { useAuth } from '../store/authStore'

const SUBSCRIBED_STORAGE_KEY = 'cz_newsletter_subscribed_email'

const SOCIAL_ICONS = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, bgClass: 'bg-[#1877F2] text-white hover:shadow-lg hover:shadow-blue-500/30' },
  { key: 'twitter', label: 'Twitter', Icon: TwitterIcon, bgClass: 'bg-[#0f172a] text-white hover:shadow-lg hover:shadow-slate-900/30' },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon, bgClass: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/30' },
  { key: 'youtube', label: 'YouTube', Icon: YoutubeIcon, bgClass: 'bg-[#FF0000] text-white hover:shadow-lg hover:shadow-red-500/30' },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon, bgClass: 'bg-[#25D366] text-white hover:shadow-lg hover:shadow-green-500/30' },
  { key: 'tiktok', label: 'TikTok', Icon: TiktokIcon, bgClass: 'bg-[#000000] text-white hover:shadow-lg hover:shadow-black/30' },
]

function MarqueeGroup({ messages }) {
  return (
    <div className="flex items-center shrink-0">
      {messages.map((message, i) => (
        <div key={i} className="flex items-center shrink-0 gap-[31px] mx-3">
          <span className="w-[10px] h-[10px] rounded-full bg-slate-900 shrink-0" />
          <div className="uppercase text-[14px] font-semibold text-slate-900 tracking-wider whitespace-nowrap">
            {message}
          </div>
        </div>
      ))}
    </div>
  )
}

function MarqueeBar({ messages }) {
  if (!messages?.length) return null
  return (
    <div className="overflow-hidden py-[7px] border-b border-slate-200" style={{ backgroundColor: '#e0f2fe' }}>
      <div className="marquee-track flex w-max">
        <MarqueeGroup messages={messages} />
        <MarqueeGroup messages={messages} />
      </div>
    </div>
  )
}

function Newsletter() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(SUBSCRIBED_STORAGE_KEY)
    const emailToCheck = user?.email || rememberedEmail
    if (!emailToCheck) return
    api
      .get(ENDPOINTS.NEWSLETTER.STATUS(emailToCheck))
      .then((data) => {
        if (data.subscribed) setAlreadySubscribed(true)
      })
      .catch((err) => console.error('Failed to check newsletter subscription status:', err))
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const data = await api.post(ENDPOINTS.NEWSLETTER.SUBSCRIBE, { email })
      localStorage.setItem(SUBSCRIBED_STORAGE_KEY, email)
      setStatus('success')
      setAlreadySubscribed(Boolean(data.alreadySubscribed))
      setEmail('')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className="bg-cz-header px-[30px] py-[25px] md:px-[60px] border-b border-cyan-600/30">
      <div className="flex flex-col items-center w-full md:w-1/2 mx-auto text-center">
        <h2 className="text-[28px] md:text-[32px] font-bold text-white mb-3 tracking-tight">Subscribe to our newsletter</h2>

        {alreadySubscribed ? (
          <p className="text-[14px] text-cyan-300 font-bold mb-[10px]">You&apos;re already subscribed to our newsletter. Thanks for being with us!</p>
        ) : status === 'success' ? (
          <p className="text-[14px] text-cyan-300 font-bold mb-[10px]">You&apos;re subscribed! Watch your inbox for offers and updates.</p>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col md:flex-row items-center justify-center gap-[10px] mb-[10px]">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email Address..."
              className="w-full md:max-w-[70%] rounded-full border border-slate-300 bg-white text-[14px] font-medium text-slate-900 placeholder-slate-400 px-[20px] py-[14px] outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full md:w-auto shrink-0 rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-bold tracking-wide px-8 py-[14px] transition-all disabled:opacity-60 cursor-pointer shadow-md hover:shadow-cyan-500/25"
            >
              {status === 'submitting' ? '...' : 'SUBSCRIBE'}
            </button>
          </form>
        )}

        {status === 'error' && <p className="text-[13px] text-rose-300 font-semibold mb-[10px]">{error}</p>}

        <p className="text-[12px] text-slate-200 leading-relaxed font-normal">
          Your personal data will be used to support your experience throughout this website, to
          manage access to your account, and for other purposes described in our{' '}
          <Link to="/privacy-policy" className="underline font-bold text-white hover:text-cyan-300">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function FooterColumn({ col }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col w-full border-b border-slate-200 sm:border-none">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full py-[15px] sm:py-0 sm:pointer-events-none sm:mb-5"
      >
        <span className="text-[17px] font-extrabold text-slate-900 tracking-tight">{col.heading}</span>
        <ChevronDownIcon
          size={14}
          className={`text-slate-800 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`flex-col ${open ? 'flex' : 'hidden'} sm:flex pb-[15px] sm:pb-0`}>
        {col.links.map((link) => (
          <SiteLink
            key={link.label}
            href={link.href}
            className="text-[14px] text-slate-800 font-bold mb-[12px] hover:text-cz-primary hover:underline transition-colors"
          >
            {link.label}
          </SiteLink>
        ))}
      </div>
    </div>
  )
}

export default function Footer() {
  const { siteName, brand } = useSiteSettings()

  const firstPhone = brand.phone.split('|')[0].trim()
  const marqueeMessages = brand.marqueeMessages
  const columns = brand.columns

  return (
    <footer className="mt-auto border-t border-slate-200">
      <MarqueeBar messages={marqueeMessages} />
      <Newsletter />

      <div className="bg-white mx-auto px-6 py-[45px] lg:py-14">
        <div className="flex flex-col lg:flex-row gap-[45px]">
          <div className="w-full lg:w-[42%] flex flex-col items-center lg:items-start text-center lg:text-left">
            <Logo variant="navy" textClassName="text-[20px] font-extrabold mb-4" hideIcon />
            <p className="text-[14px] text-slate-800 font-semibold leading-relaxed max-w-md">{brand.description}</p>

            <div className="flex flex-col gap-3.5 mt-6 w-full">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-[14px] font-bold text-slate-900 hover:text-cz-primary transition-colors text-left"
              >
                <span className="p-2 rounded-lg bg-[#0C4A6E] text-white shrink-0 shadow-sm group-hover:bg-cz-primary transition-colors">
                  <LocationIcon size={18} />
                </span>
                <span className="group-hover:underline">{brand.address}</span>
              </a>

              <a
                href={`tel:${firstPhone}`}
                className="group flex items-center gap-3 text-[14px] font-bold text-slate-900 hover:text-cz-primary transition-colors"
              >
                <span className="p-2 rounded-lg bg-[#0C4A6E] text-white shrink-0 shadow-sm group-hover:bg-cz-primary transition-colors">
                  <PhoneIcon size={18} />
                </span>
                <span className="group-hover:underline">{brand.phone}</span>
              </a>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(brand.email)}&su=${encodeURIComponent('Inquiry from Website')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-[14px] font-bold text-slate-900 hover:text-cz-primary transition-colors"
              >
                <span className="p-2 rounded-lg bg-[#0C4A6E] text-white shrink-0 shadow-sm group-hover:bg-cz-primary transition-colors">
                  <MailIcon size={18} />
                </span>
                <span className="group-hover:underline">{brand.email}</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-7">
              {SOCIAL_ICONS.map(({ key, label, Icon, bgClass }) => {
                let href = brand.social[key]
                if (href && key === 'whatsapp') {
                  if (!href.startsWith('http')) {
                    const digits = href.replace(/\D/g, '')
                    href = digits ? `https://wa.me/${digits}?text=Hi%21%20I%27d%20like%20to%20inquire%20about%20a%20product.` : null
                  }
                }
                return href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`inline-flex p-2.5 rounded-xl ${bgClass} shadow-sm hover:scale-110 transition-all duration-200 cursor-pointer`}
                  >
                    <Icon size={18} />
                    <span className="sr-only">{label}</span>
                  </a>
                ) : (
                  <span key={key} aria-label={label} className={`inline-flex p-2.5 rounded-xl ${bgClass} opacity-80 cursor-default`}>
                    <Icon size={18} />
                  </span>
                )
              })}
            </div>
          </div>

          <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-[30px]">
            {columns.map((col) => (
              <FooterColumn key={col.heading} col={col} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cz-header text-white mx-auto px-5 py-4 border-t border-cyan-600/30">
        <p className="text-center text-[13px] font-bold tracking-wide">© {new Date().getFullYear()} {siteName}. All Rights Reserved</p>
        <p className="text-center text-[13px] tracking-wide mt-1">
          <span className="text-cyan-100/90 font-medium">Powered by </span>
          <span className="text-[#38BDF8] font-black">IT </span>
          <span className="text-white font-extrabold">SOLUTIONS</span>
        </p>
      </div>
    </footer>
  )
}
