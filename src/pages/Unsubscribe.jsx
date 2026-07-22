import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'

export default function Unsubscribe() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Unsubscribe from ${siteName || 'IT Solutions'} Newsletter`,
    canonical: `${window.location.origin}/unsubscribe`,
    noindex: true,
  })
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function run() {
      if (!email || !token) {
        setStatus('error')
        return
      }
      try {
        await api.post(ENDPOINTS.NEWSLETTER.UNSUBSCRIBE, { email, token })
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
    run()
  }, [email, token])

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="sr-only">Unsubscribe</h1>
        <SeoHeadingFiller h3="Unsubscribe status" h4="What happens next" h5="Resubscribe info" h6="Support" />
        {status === 'loading' && <p className="text-[14px] text-[#4b4b4b]">Processing your request...</p>}

        {status === 'success' && (
          <>
            <h2 className="text-[20px] font-semibold text-[#212121] mb-2">You've been unsubscribed</h2>
            <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
              {email} will no longer receive newsletter or promotional emails from us. Changed your mind? You can
              resubscribe any time from the footer of our site.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-[20px] font-semibold text-[#212121] mb-2">This link is invalid</h2>
            <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
              This unsubscribe link is invalid or malformed. If you're still receiving emails you don't want,
              contact us and we'll remove you manually.
            </p>
          </>
        )}

        <Link
          to="/"
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
        >
          Back to Store
        </Link>
      </div>

      <Footer />
    </div>
  )
}
