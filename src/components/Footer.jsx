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
  const safeMessages = Array.isArray(messages) ? messages : []
  return (
    <div className="flex items-center shrink-0">
      {safeMessages.map((message, i) => (
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
  if (!Array.isArray(messages) || messages.length === 0) return null
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
        if (data?.subscribed) setAlreadySubscribed(true)
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
      setAlreadySubscribed(Boolean(data?.alreadySubscribed))
      setEmail('')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className="bg-cz-header px-4 py-6 sm:px-8 sm:py-8 border-b border-cyan-600/30">
      <div className="flex flex-col items-center w-full max-w-[620px] mx-auto text-center">
        <h2 className="text-[20px] sm:text-[26px] md:text-[32px] font-bold text-white mb-3 tracking-tight">
          Subscribe to our newsletter
        </h2>

        {alreadySubscribed ? (
          <p className="text-[13px] sm:text-[14px] text-cyan-300 font-bold mb-3">You&apos;re already subscribed to our newsletter. Thanks for being with us!</p>
        ) : status === 'success' ? (
          <p className="text-[13px] sm:text-[14px] text-cyan-300 font-bold mb-3">You&apos;re subscribed! Watch your inbox for offers and updates.</p>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-row items-center justify-center gap-2 mb-3 max-w-[540px]">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email Address..."
              className="flex-1 min-w-0 rounded-full border border-slate-300 bg-white text-[12px] sm:text-[14px] font-medium text-slate-900 placeholder-slate-400 px-4 sm:px-5 py-2.5 sm:py-3.5 outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="shrink-0 rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[11px] sm:text-[13px] md:text-[14px] font-bold tracking-wider px-4 sm:px-7 py-2.5 sm:py-3.5 transition-all disabled:opacity-60 cursor-pointer shadow-md hover:shadow-cyan-500/25 uppercase"
            >
              {status === 'submitting' ? '...' : 'SUBSCRIBE'}
            </button>
          </form>
        )}

        {status === 'error' && <p className="text-[12px] sm:text-[13px] text-rose-300 font-semibold mb-2">{error}</p>}

        <p className="text-[11px] sm:text-[12px] text-slate-200 leading-relaxed font-normal max-w-[500px]">
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
  const safeLinks = Array.isArray(col?.links) ? col.links : []

  return (
    <div className="flex flex-col w-full border-b border-slate-200 sm:border-none">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between w-full py-[15px] sm:py-0 sm:pointer-events-none sm:mb-5"
      >
        <span className="text-[17px] font-extrabold text-slate-900 tracking-tight">{col?.heading}</span>
        <ChevronDownIcon
          size={14}
          className={`text-slate-800 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`flex-col ${open ? 'flex' : 'hidden'} sm:flex pb-[15px] sm:pb-0`}>
        {safeLinks.map((link) => (
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

  const firstPhone = brand?.phone ? brand.phone.split('|')[0].trim() : ''
  const marqueeMessages = Array.isArray(brand?.marqueeMessages) ? brand.marqueeMessages : []
  const columns = Array.isArray(brand?.columns) ? brand.columns : []

  return (
    <footer className="w-full bg-[#f8fafc] text-slate-900 border-t border-slate-200 mt-auto">
      <MarqueeBar messages={marqueeMessages} />
      <Newsletter />

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-slate-200">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo />
            <p className="text-[13px] sm:text-[14px] text-slate-600 leading-relaxed max-w-[380px] font-medium">
              {brand?.description || 'Your premier destination for high-performance laptops, desktops, components, networking gear, and tech accessories in Pakistan.'}
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {brand?.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-[13px] sm:text-[14px] text-slate-700 hover:text-cz-primary font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100 group-hover:bg-cz-primary group-hover:text-white transition-all">
                    <LocationIcon size={16} />
                  </div>
                  <span className="group-hover:underline">{brand.address}</span>
                </a>
              )}

              {brand?.phone && (
                <a
                  href={`tel:${firstPhone}`}
                  className="group flex items-center gap-3 text-[13px] sm:text-[14px] text-slate-700 hover:text-cz-primary font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100 group-hover:bg-cz-primary group-hover:text-white transition-all">
                    <PhoneIcon size={16} />
                  </div>
                  <span className="group-hover:underline">{brand.phone}</span>
                </a>
              )}

              {brand?.email && (
                <a
                  href={`mailto:${brand.email}`}
                  className="group flex items-center gap-3 text-[13px] sm:text-[14px] text-slate-700 hover:text-cz-primary font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100 group-hover:bg-cz-primary group-hover:text-white transition-all">
                    <MailIcon size={16} />
                  </div>
                  <span className="group-hover:underline">{brand.email}</span>
                </a>
              )}
            </div>

            {/* Social Media Pills */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              {SOCIAL_ICONS.map(({ key, label, Icon, bgClass }) => {
                const href = brand?.social?.[key]
                return href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:-translate-y-1 ${bgClass}`}
                  >
                    <Icon size={18} />
                  </a>
                ) : null
              })}
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {columns.map((col, idx) => (
            <FooterColumn key={idx} col={col} />
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[13px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} {siteName || 'IT Solutions'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-cz-primary hover:underline">Privacy Policy</Link>
            <Link to="/return-exchange" className="hover:text-cz-primary hover:underline">Return Policy</Link>
            <Link to="/contact" className="hover:text-cz-primary hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
