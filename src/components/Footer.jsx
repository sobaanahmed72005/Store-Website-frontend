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
} from './icons'
import SiteLink from './SiteLink'
import { api } from '../api/client'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useAuth } from '../context/AuthContext'

const SUBSCRIBED_STORAGE_KEY = 'cz_newsletter_subscribed_email'

const DEFAULT_BRAND = {
  description: '',
  address: '',
  phone: '',
  email: '',
  social: { facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '', tiktok: '' },
  columns: [],
  marqueeMessages: [],
}

const SOCIAL_ICONS = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'twitter', label: 'Twitter', Icon: TwitterIcon },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'youtube', label: 'YouTube', Icon: YoutubeIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TiktokIcon },
]

function MarqueeGroup({ messages }) {
  return (
    <div className="flex items-center shrink-0">
      {messages.map((message, i) => (
        <div key={i} className="flex items-center shrink-0 gap-[31px] mx-3">
          <span className="w-[10px] h-[10px] rounded-full bg-black shrink-0" />
          <div className="uppercase text-[14px] font-light text-black whitespace-nowrap">
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
    <div className="overflow-hidden py-[5px]" style={{ backgroundColor: 'rgb(212, 231, 252)' }}>
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
      .get(`/newsletter/status?email=${encodeURIComponent(emailToCheck)}`)
      .then((data) => {
        if (data.subscribed) setAlreadySubscribed(true)
      })
      .catch(() => {})
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const data = await api.post('/newsletter/subscribe', { email })
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
    <div className="bg-cz-topbar px-[30px] py-[19px] md:px-[60px]">
      <div className="flex flex-col items-center w-full md:w-1/2 mx-auto text-center">
        <h2 className="text-[30px] font-semibold text-white mb-4">Subscribe to our newsletter</h2>

        {alreadySubscribed ? (
          <p className="text-[14px] text-cz-accent mb-[10px]">You're already subscribed to our newsletter. Thanks for being with us!</p>
        ) : status === 'success' ? (
          <p className="text-[14px] text-cz-accent mb-[10px]">You're subscribed! Watch your inbox for offers and updates.</p>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col md:flex-row items-center justify-center gap-[10px] mb-[10px]">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email Address..."
              className="w-full md:max-w-[70%] rounded-full border border-[#888888] bg-white text-[14px] text-black placeholder-[#888888] px-[15px] py-[15px] outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full md:w-[20%] shrink-0 rounded-full bg-cz-accent hover:bg-cz-accent-hover text-black text-[14px] font-medium px-5 py-[15px] transition-colors disabled:opacity-60"
            >
              {status === 'submitting' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && <p className="text-[13px] text-red-300 mb-[10px]">{error}</p>}

        <p className="text-[12px] text-[#dedede]">
          Your personal data will be used to support your experience throughout this website, to
          manage access to your account, and for other purposes described in our{' '}
          <Link to="/privacy-policy" className="underline hover:text-white">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default function Footer() {
  const { siteName } = useSiteSettings()
  const [brand, setBrand] = useState(DEFAULT_BRAND)

  useEffect(() => {
    api
      .get('/content/footer-brand')
      .then((data) => setBrand({ ...DEFAULT_BRAND, ...data, social: { ...DEFAULT_BRAND.social, ...data.social } }))
      .catch(() => {})
  }, [])

  const firstPhone = brand.phone.split('|')[0].trim()
  const marqueeMessages = brand.marqueeMessages?.length ? brand.marqueeMessages : DEFAULT_BRAND.marqueeMessages
  const columns = brand.columns?.length ? brand.columns : DEFAULT_BRAND.columns

  return (
    <footer>
      <MarqueeBar messages={marqueeMessages} />
      <Newsletter />

      <div className="bg-cz-gold-light max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-[35px] lg:py-10">
        <div className="flex flex-col lg:flex-row gap-[40px]">
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-[16px] font-semibold text-black mb-5">{siteName}</span>
            <p className="text-[14px] text-black">{brand.description}</p>

            <div className="flex flex-col gap-[10px] mt-5">
              <div className="flex items-center gap-[10px] text-[15px] text-black">
                <LocationIcon size={24} className="shrink-0" />
                <span>{brand.address}</span>
              </div>
              <a
                href={`tel:${firstPhone}`}
                className="flex items-center gap-[10px] text-[15px] text-black hover:underline"
              >
                <PhoneIcon size={24} className="shrink-0" />
                <span>{brand.phone}</span>
              </a>
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(brand.email)}&su=${encodeURIComponent('Inquiry from Website')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[10px] text-[15px] text-black hover:underline"
              >
                <MailIcon size={24} className="shrink-0" />
                <span>{brand.email}</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-[15px] mt-[15px]">
              {SOCIAL_ICONS.map(({ key, label, Icon }) => {
                let href = brand.social[key]
                if (href && key === 'whatsapp') {
                  // Convert stored number to wa.me direct-chat link
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
                    className="text-black hover:text-cz-primary"
                  >
                    <Icon size={24} />
                  </a>
                ) : (
                  <span key={key} aria-label={label} className="text-black cursor-default">
                    <Icon size={24} />
                  </span>
                )
              })}
            </div>
          </div>

          <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-[20px]">
            {columns.map((col) => (
              <div key={col.heading} className="flex flex-col w-full">
                <span className="text-[16px] font-semibold text-black mb-5">{col.heading}</span>
                {col.links.map((link) => (
                  <SiteLink
                    key={link.label}
                    href={link.href}
                    className="text-[14px] text-black mb-[15px] hover:underline"
                  >
                    {link.label}
                  </SiteLink>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cz-topbar text-white text-[12px] max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-[15px]">
        <p className="text-center">© {new Date().getFullYear()} {siteName}. All Rights Reserved</p>
      </div>
    </footer>
  )
}
