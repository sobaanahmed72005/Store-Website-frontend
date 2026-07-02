import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
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
} from '../components/icons'
import { api } from '../api/client'

const DEFAULT_BRAND = {
  address: '',
  phone: '',
  email: '',
  hours: '',
  social: { facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '', tiktok: '' },
}

const SOCIAL_ICONS = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'twitter', label: 'Twitter', Icon: TwitterIcon },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'youtube', label: 'YouTube', Icon: YoutubeIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TiktokIcon },
]

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] text-[#4b4b4b]">{label}</label>
      <input
        {...props}
        className="w-full rounded-md border border-[#d1d5db] bg-white text-[14px] text-[#212121] placeholder-[#9ca3af] px-4 py-3 outline-none focus:border-cz-primary transition-colors"
      />
    </div>
  )
}

export default function Contact() {
  const [brand, setBrand] = useState(DEFAULT_BRAND)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/content/footer-brand')
      .then((data) => setBrand({ ...DEFAULT_BRAND, ...data, social: { ...DEFAULT_BRAND.social, ...data.social } }))
      .catch(() => {})
  }, [])

  const firstPhone = brand.phone ? brand.phone.split('|')[0].trim() : ''

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/contact', form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">Contact Us</h1>
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>Contact Us</span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
          <div className="flex flex-col gap-5">
            {brand.address && (
              <div className="flex items-center gap-[10px] text-[15px] text-[#212121]">
                <LocationIcon size={24} className="shrink-0" />
                <span>{brand.address}</span>
              </div>
            )}
            {brand.phone && (
              <a
                href={`tel:${firstPhone}`}
                className="flex items-center gap-[10px] text-[15px] text-[#212121] hover:underline"
              >
                <PhoneIcon size={24} className="shrink-0" />
                <span>{brand.phone}</span>
              </a>
            )}
            {brand.email && (
              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-[10px] text-[15px] text-[#212121] hover:underline"
              >
                <MailIcon size={24} className="shrink-0" />
                <span>{brand.email}</span>
              </a>
            )}
            {brand.hours && (
              <div className="text-[14px] text-[#4b4b4b] mt-2">Store Timings: {brand.hours}</div>
            )}

            <div className="flex flex-wrap gap-[15px] mt-2">
              {SOCIAL_ICONS.map(({ key, label, Icon }) => {
                const href = brand.social[key]
                return href ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-[#212121] hover:text-cz-primary"
                  >
                    <Icon size={24} />
                  </a>
                ) : null
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-[#212121]">Send us a message</h2>

            {status === 'success' ? (
              <p className="text-[14px] text-green-700">Thanks! Your message has been sent — we'll get back to you soon.</p>
            ) : (
              <>
                {error && <div className="text-[13px] text-red-600">{error}</div>}
                <Input label="Name" name="name" type="text" placeholder="Your name" value={form.name} onChange={handleChange} required />
                <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                <Input label="Subject" name="subject" type="text" placeholder="How can we help?" value={form.subject} onChange={handleChange} />
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] text-[#4b4b4b]">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Write your message..."
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-[#d1d5db] bg-white text-[14px] text-[#212121] placeholder-[#9ca3af] px-4 py-3 outline-none focus:border-cz-primary resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="self-start rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-2.5 px-8 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
