import { useState } from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  WhatsappIcon,
  TiktokIcon,
} from '../components/icons'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

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
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-slate-700">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 placeholder-[#9ca3af] px-4 py-3 outline-none focus:border-cz-primary focus:bg-white focus:ring-2 focus:ring-cz-sky/20 transition-all"
      />
    </div>
  )
}

export default function Contact() {
  const { siteName, brand, sitePhone } = useSiteSettings()

  useSeo({
    title: `Contact Us — Support & Customer Care | ${siteName || 'IT Solutions'}`,
    description: `Get in touch with ${siteName || 'IT Solutions'} — send us a message or chat on WhatsApp.`,
    canonical: `${window.location.origin}/contact`,
    keywords: `contact ${siteName || 'IT Solutions'}, customer support Pakistan, computer store contact`,
    publisher: siteName || 'IT Solutions',
  })
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post(ENDPOINTS.CONTACT.BASE, form)
      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasSocials = SOCIAL_ICONS.some(({ key }) => Boolean(brand?.social?.[key]))

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Title Heading (Symmetrically Aligned to 1000px) */}
        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
              Contact Us
            </h1>
            <SeoHeadingFiller h3="Store information" h4="Contact form" h5="Business hours" h6="Social links" />
          </div>

          {sitePhone && (
            <a
              href={`https://wa.me/${sitePhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[13px] font-semibold shadow hover:scale-105 transition-all text-center self-start sm:self-auto"
            >
              <span>💬 Instant WhatsApp Chat</span>
            </a>
          )}
        </div>

        {/* Message Form Card Container - Matches 1000px Width Symmetrically */}
        <div className="w-full bg-white rounded-xl p-5 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#0891b2] to-[#38bdf8]" />

          <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-800 font-heading mb-1.5">
            Send Us a Message
          </h2>
          <p className="text-[13px] text-slate-500 mb-6">
            Have a product question or need assistance with an order? Drop us a message below!
          </p>

          {status === 'success' ? (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px]">
              🎉 <strong>Thank you!</strong> Your message has been sent successfully — our support team will get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[13px]">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Subject"
                name="subject"
                type="text"
                placeholder="How can we help?"
                value={form.subject}
                onChange={handleChange}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 placeholder-[#9ca3af] px-4 py-3 outline-none focus:border-cz-primary focus:bg-white focus:ring-2 focus:ring-cz-sky/20 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 self-start rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-3 px-8 shadow hover:shadow-md transition-all disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          {/* Social Icons Footer Row */}
          {hasSocials && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                Follow Us:
              </span>
              <div className="flex items-center gap-3">
                {SOCIAL_ICONS.map(({ key, label, Icon }) => {
                  const href = brand?.social?.[key]
                  return href ? (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-slate-500 hover:text-cz-primary hover:scale-110 transition-transform"
                    >
                      <Icon size={20} />
                    </a>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
