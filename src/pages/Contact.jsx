import { useState } from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

export default function Contact() {
  const { siteName, brand } = useSiteSettings()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const displayAddress = brand?.address || 'Office # 19, 2nd Floor, Fazal Trade Center, Near Hafeez Center, Gulberg III, Lahore, Punjab 54660, Pakistan'
  const displayPhone = brand?.phone || '+92 300 4265499'
  const displayEmail = brand?.email || 'itsolutions543@gmail.com'
  const displayHours = brand?.hours || 'Monday – Saturday (10:00 AM – 8:00 PM PKT)'
  const mapQuery = encodeURIComponent(displayAddress)

  useSeo({
    title: `Contact Us — Customer Support & Store Location | ${siteName || 'IT Solutions'} Pakistan`,
    description: `Contact ${siteName || 'IT Solutions'} customer support. Get help with laptop sales, CCTV camera quotes, order tracking, and store address in Lahore, Pakistan. Phone/WhatsApp: ${displayPhone}.`,
    canonical: `${window.location.origin}/contact`,
    keywords: `contact ${siteName || 'IT Solutions'}, IT Solutions phone number, computer store Lahore location, customer support Pakistan`,
    publisher: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      mainEntity: {
        '@type': 'LocalBusiness',
        name: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
        telephone: displayPhone,
        email: displayEmail,
        priceRange: 'PKR',
        address: {
          '@type': 'PostalAddress',
          streetAddress: displayAddress,
          addressLocality: 'Lahore',
          addressRegion: 'Punjab',
          postalCode: '54660',
          addressCountry: 'PK',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 31.5126,
          longitude: 74.3436,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '20:00',
          },
        ],
        hasMap: `https://maps.google.com/?q=${mapQuery}`,
      },
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      await api.post(ENDPOINTS.CONTACT.SUBMIT, form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Title Heading */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            Contact Us
          </h1>
          <SeoHeadingFiller h4="Contact details" h5="Send a message" h6="Map location" />
        </div>

        {/* Contact Message Form Card with Vertical Sky Blue Side Accent Line */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 sm:p-7 shadow-sm mb-6 relative overflow-hidden group">
          {/* Vertical Sky Blue Side Accent Bar */}
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[#0891b2] to-[#38bdf8] opacity-80 group-hover:w-1.5 transition-all" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 pl-1 sm:pl-2">
            <div>
              <h2 className="text-[17px] sm:text-[19px] font-bold text-slate-800 font-heading">Send Us a Message</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Fill out the form below and our support team will respond promptly.</p>
            </div>
            {sitePhone && (
              <a
                href={`https://wa.me/${sitePhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-[13px] font-semibold shadow transition-all shrink-0"
              >
                <span>WhatsApp Support</span>
              </a>
            )}
          </div>

          {status === 'success' ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] px-5 py-4 shadow-sm ml-1 sm:ml-2">
              ✨ Thank you! Your message has been sent successfully. We will get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pl-1 sm:pl-2">
              {status === 'error' && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px] px-4 py-3">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
                    placeholder="e.g. +92 300 1234567"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="self-start rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold px-7 py-3 shadow hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {status === 'submitting' ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Store Location & Interactive Google Maps Embed Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[#0c4a6e] font-heading tracking-wider uppercase mb-1">
                Main Branch Location
              </div>
              <h3 className="text-[18px] font-bold text-slate-800 font-heading mb-2">
                IT Solutions Lahore Store
              </h3>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-3">
                {displayAddress}
              </p>
              <div className="space-y-1.5 text-[13px] text-slate-600 mb-4">
                <p><strong>Phone / WhatsApp:</strong> {displayPhone}</p>
                <p><strong>Support Email:</strong> {displayEmail}</p>
                <p><strong>Working Hours:</strong> {displayHours}</p>
              </div>
            </div>

            {/* Interactive Embedded Google Map */}
            <div className="w-full h-[280px] rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4 relative bg-slate-100">
              <iframe
                title="IT Solutions Lahore Store Location Map"
                src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            <a
              href={`https://maps.google.com/?q=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0c4a6e] hover:bg-[#083b58] text-white text-[13px] font-semibold px-5 py-2.5 shadow transition-all self-start"
            >
              📍 Open Directions in Google Maps
            </a>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[13px] font-semibold text-emerald-700 font-heading tracking-wider uppercase mb-1">
                Nationwide Delivery & Branch Network
              </div>
              <h3 className="text-[18px] font-bold text-slate-800 font-heading mb-2">
                Serving All Cities Across Pakistan
              </h3>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-4">
                We provide fast Cash on Delivery (COD) and courier dispatch to Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Burewala, Peshawar, Quetta, and 200+ cities nationwide.
              </p>
              <ul className="text-[13px] text-slate-600 space-y-2.5 list-disc list-inside bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <li><strong>Official Brand Warranty:</strong> 100% Original products with brand support</li>
                <li><strong>Free Shipping:</strong> On your 1st order nationwide (Rs 180 standard)</li>
                <li><strong>7-Day Return Guarantee:</strong> Hassle-free return & exchange policy</li>
                <li><strong>Dedicated Technical Support:</strong> Direct WhatsApp & phone assistance</li>
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <h4 className="text-[14px] font-bold text-slate-800 mb-1">Burewala Regional Branch</h4>
              <p className="text-[13px] text-slate-600 mb-3">Store # 12, Main College Road, Burewala, Vehari, Punjab 61010</p>
              <a
                href="https://maps.google.com/?q=Main+College+Road+Burewala"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[13px] font-semibold px-4 py-2 transition-all"
              >
                🗺️ Burewala Map Location
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
