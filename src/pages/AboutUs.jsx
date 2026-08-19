import { useEffect, useState } from 'react'
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
  paragraphs: [],
  highlights: [],
  storeAddress: '',
  storeTimings: '',
}

export default function AboutUs() {
  const { siteName } = useSiteSettings()
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    api
      .get(ENDPOINTS.CONTENT.ABOUT_US)
      .then((data) => {
        if (!data || typeof data !== 'object') return
        setContent({
          paragraphs: Array.isArray(data.paragraphs) ? data.paragraphs : [],
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          storeAddress: typeof data.storeAddress === 'string' ? data.storeAddress : '',
          storeTimings: typeof data.storeTimings === 'string' ? data.storeTimings : '',
        })
      })
      .catch((err) => console.error('Failed to load /content/about-us content:', err))
  }, [])

  const safeParagraphs = Array.isArray(content?.paragraphs) ? content.paragraphs : []
  const safeHighlights = Array.isArray(content?.highlights) ? content.highlights : []

  useSeo({
    title: `About ${siteName || 'IT Solutions'} — Our Story & Store Details`,
    description: safeParagraphs[0]?.slice(0, 155) || `Learn more about ${siteName || 'IT Solutions'}.`,
    canonical: `${window.location.origin}/about-us`,
    keywords: `about ${siteName || 'IT Solutions'}, computer store Pakistan, laptop store Pakistan`,
    publisher: siteName || 'IT Solutions',
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Title Heading (No Breadcrumbs) */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            About Us
          </h1>
          <SeoHeadingFiller h4="Why choose us" h5="Store details" h6="Get in touch" />
        </div>

        {/* Intro Paragraphs Card */}
        {safeParagraphs.length > 0 && (
          <section className="w-full bg-white rounded-xl p-5 sm:p-7 border border-slate-100 shadow-sm mb-6 flex flex-col gap-4 text-[14px] sm:text-[15px] text-slate-700 leading-relaxed font-normal">
            {safeParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        )}

        {/* Highlights Cards (2x2 Grid on Mobile, 4 Columns on Desktop) */}
        {safeHighlights.length > 0 && (
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
            {safeHighlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-w-0 flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-[#0891b2] to-[#38bdf8] opacity-80 group-hover:w-1.5 transition-all" />
                <div className="pl-1">
                  <h3 className="text-[12px] sm:text-[15px] font-bold text-slate-800 font-heading mb-1 sm:mb-1.5 leading-snug">
                    {item?.title || ''}
                  </h3>
                  <p className="text-[11px] sm:text-[13px] text-slate-500 leading-relaxed">{item?.description || ''}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Visit Our Store Card (Deep Ocean Navy Blue Gradient Card) */}
        {(content.storeAddress || content.storeTimings) && (
          <section className="w-full bg-gradient-to-r from-[#0c4a6e] to-[#0b658a] text-white rounded-xl p-5 sm:p-6 shadow-md flex items-center gap-4 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-white/10 text-cz-sky flex items-center justify-center text-xl shrink-0 border border-white/10">
              📍
            </div>
            <div>
              <h3 className="text-[16px] sm:text-[17px] font-bold text-white font-heading mb-0.5">
                Visit Our Store
              </h3>
              {content.storeAddress && (
                <p className="text-[13px] text-slate-200">{content.storeAddress}</p>
              )}
              {content.storeTimings && (
                <p className="text-[13px] text-slate-200 mt-0.5">
                  Store Timings: {content.storeTimings}
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
