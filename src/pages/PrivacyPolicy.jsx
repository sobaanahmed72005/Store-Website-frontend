import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

const DEFAULT_CONTENT = {
  pageTitle: 'Privacy Policy',
  sections: [],
}

const TOPIC_BADGES = [
  { icon: '🔒', title: 'Data Encryption', desc: 'Secure SSL 256-bit encryption' },
  { icon: '🛡️', title: 'Zero Third-Party Sharing', desc: 'Your personal data stays private' },
  { icon: '⚖️', title: 'Full Data Control', desc: 'Request data access anytime' },
]

export default function PrivacyPolicy() {
  const { siteName } = useSiteSettings()
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    api
      .get(ENDPOINTS.CONTENT.PRIVACY_POLICY)
      .then((data) => {
        if (!data || typeof data !== 'object') return
        setContent({
          pageTitle: data.pageTitle || 'Privacy Policy',
          sections: Array.isArray(data.sections) ? data.sections : [],
        })
      })
      .catch((err) => console.error('Failed to load /content/privacy-policy content:', err))
  }, [])

  const title = content?.pageTitle || 'Privacy Policy'
  const safeSections = Array.isArray(content?.sections) ? content.sections : []

  useSeo({
    title: `${title} — How We Protect Your Data | ${siteName || 'IT Solutions'}`,
    description: `Read the privacy policy at ${siteName || 'IT Solutions'}.`,
    canonical: `${window.location.origin}/privacy-policy`,
    keywords: `privacy policy, data protection, ${siteName || 'IT Solutions'} privacy`,
    publisher: siteName || 'IT Solutions',
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Title Heading (No Hero Banner & No Breadcrumbs) */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            {title}
          </h1>
          <SeoHeadingFiller h3="Policy details" h4="Data we collect" h5="Your rights" h6="Contact for help" />
        </div>

        {/* Quick Highlights Bar - STRICTLY 3-Column Side-by-Side Row on Mobile */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 mb-6">
          {TOPIC_BADGES.map((b, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-3.5 bg-white p-2 sm:p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group min-w-0"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-cz-sky/10 text-cz-primary flex items-center justify-center text-xs sm:text-lg shrink-0 group-hover:scale-105 transition-transform">
                {b.icon}
              </div>
              <div className="min-w-0 w-full">
                <h4 className="text-[10px] sm:text-[14px] font-semibold text-slate-800 leading-tight sm:leading-snug truncate">
                  {b.title}
                </h4>
                <p className="text-[9px] sm:text-[12px] text-slate-500 leading-tight mt-0.5 hidden xs:block sm:block truncate">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Policy Cards Stream - Symmetrically Aligned */}
        <section className="grid grid-cols-1 gap-4 mb-8">
          {safeSections.map((section, i) => (
            <div
              key={i}
              className="bg-[#ffffff] rounded-xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Decorative Side Accent Bar */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[#0891b2] to-[#38bdf8] opacity-80 group-hover:w-1.5 transition-all" />

              <div className="flex items-start gap-3 pl-1 sm:pl-2">
                <span className="text-[12px] sm:text-[13px] font-bold text-[#0891b2] bg-[#f0f9ff] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shrink-0 border border-[#bae6fd]">
                  {i < 9 ? `0${i + 1}` : i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] sm:text-[16px] font-bold text-slate-800 font-heading mb-1.5 pt-0.5">
                    {section?.heading || ''}
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                    {section?.body || ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Support Contact Callout Banner */}
        <div className="bg-gradient-to-r from-[#0c4a6e] to-[#0b658a] text-white rounded-xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5 relative overflow-hidden">
          <div className="relative z-10 text-center sm:text-left">
            <h3 className="text-[17px] sm:text-[18px] font-bold text-white mb-1">Questions About Your Data Privacy?</h3>
            <p className="text-[12px] sm:text-[13px] text-slate-200 max-w-md">
              We respect your privacy. If you have any questions regarding your data or account security, feel free to reach out.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-cz-primary hover:bg-cz-sky hover:text-white text-[13px] font-semibold shadow hover:scale-105 transition-all text-center"
            >
              <span>Contact Privacy Officer</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}