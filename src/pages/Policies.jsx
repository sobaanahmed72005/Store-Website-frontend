import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'

const DEFAULT_CONTENT = {
  pageTitle: '',
  sections: [],
}

export default function Policies() {
  const { siteName } = useSiteSettings()
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    api
      .get('/content/policies')
      .then(setContent)
      .catch(() => {})
  }, [])

  useSeo({
    title: `Return & Exchange Policy | ${siteName || 'IT Network'}`,
    description: `Read the return and exchange policy at ${siteName || 'IT Network'}.`,
    canonical: `${window.location.origin}/return-exchange`,
  })

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">{content.pageTitle}</h1>
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