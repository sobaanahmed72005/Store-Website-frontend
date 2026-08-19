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
  const { siteName, sitePhone } = useSiteSettings()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useSeo({
    title: `Contact Us — Get in Touch | ${siteName || 'IT Solutions'}`,
    description: `Contact ${siteName || 'IT Solutions'}. We're here to help with order inquiries, product questions, and technical support.`,
    canonical: `${window.location.origin}/contact`,
    keywords: `contact ${siteName || 'IT Solutions'}, customer support, computer store contact`,
    publisher: siteName || 'IT Solutions',
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
      <Navbar />
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
      </main>

      <Footer />
    </div>
  )
}
