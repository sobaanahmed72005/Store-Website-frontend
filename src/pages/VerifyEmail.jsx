import { useEffect, useRef, useState } from 'react'
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

export default function VerifyEmail() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Verify Your Email — ${siteName || 'IT Solutions'} Account`,
    canonical: `${window.location.origin}/verify-email`,
    noindex: true,
  })
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')
  const hasVerified = useRef(false)

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error')
        return
      }
      if (hasVerified.current) return
      hasVerified.current = true
      try {
        await api.get(ENDPOINTS.AUTH.VERIFY_EMAIL(token))
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="sr-only">Verify Email</h1>
        <SeoHeadingFiller h3="Verification status" h4="Next steps" h5="Resend link" h6="Support" />
        {status === 'loading' && <p className="text-[14px] text-[#4b4b4b]">Verifying your email...</p>}

        {status === 'success' && (
          <>
            <h2 className="text-[20px] font-semibold text-[#212121] mb-2">Email verified</h2>
            <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
              Your email address has been verified successfully.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-[20px] font-semibold text-[#212121] mb-2">Verification link invalid</h2>
            <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
              This verification link is invalid or has already been used. You can request a new one from your
              account page.
            </p>
          </>
        )}

        <Link
          to="/account"
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
        >
          Go to My Account
        </Link>
      </div>

      <Footer />
    </div>
  )
}
