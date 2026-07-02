import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'

const DEFAULT_CONTENT = {
  paragraphs: [],
  highlights: [],
  storeAddress: '',
  storeTimings: '',
}

export default function AboutUs() {
  const [content, setContent] = useState(DEFAULT_CONTENT)

  useEffect(() => {
    api
      .get('/content/about-us')
      .then(setContent)
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">About Us</h1>
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>About Us</span>
          </div>
        </section>

        <section className="max-w-[800px] text-[14px] text-[#4b4b4b] leading-relaxed flex flex-col gap-4 mb-10">
          {content.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {content.highlights.map((item) => (
            <div key={item.title} className="rounded-[10px] border border-[#dedede] p-5">
              <h3 className="text-[16px] font-semibold text-[#212121] mb-2">{item.title}</h3>
              <p className="text-[13px] text-[#4b4b4b] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[10px] bg-cz-gold-light p-5 text-[14px] text-[#4b4b4b]">
          <h2 className="text-[18px] font-semibold text-[#212121] mb-2">Visit Our Store</h2>
          <p>{content.storeAddress}</p>
          <p className="mt-1">Store Timings: {content.storeTimings}</p>
        </section>
      </div>

      <Footer />
    </div>
  )
}
