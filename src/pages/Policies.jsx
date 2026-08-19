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
  pageTitle: '',
  sections: [],
}

export default function Policies() {
  const { siteName } = useSiteSettings()
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    api
      .get(ENDPOINTS.CONTENT.POLICIES)
      .then(setContent)
      .catch((err) => console.error('Failed to load /content/policies content:', err))
  }, [])

  useSeo({
    title: `Return & Exchange Policy — How It Works | ${siteName || 'IT Solutions'}`,
    description: `Read the return and exchange policy at ${siteName || 'IT Solutions'}.`,
    canonical: `${window.location.origin}/return-exchange`,
    keywords: `return policy, exchange policy, ${siteName || 'IT Solutions'} returns`,
    publisher: siteName || 'IT Solutions',
  })

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full mx-auto px-5 py-5">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">{content.pageTitle}</h1>
          <SeoHeadingFiller h3="Policy details" h4="Eligibility" h5="Process" h6="Contact for help" />
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>{content.pageTitle}</span>
          </div>
        </section>

        <section className="max-w-[800px] flex flex-col gap-6 pb-10">
          {content.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-[16px] font-semibold text-[#212121] mb-1.5">{section.heading}</h2>
              <p className="text-[14px] text-[#4b4b4b] leading-relaxed">{section.body}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  )
}