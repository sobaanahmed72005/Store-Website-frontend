import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'

export default function VerifyEmail() {
  useSeo({ title: 'Verify Email', noindex: true })
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error')
        return
      }
      try {
        await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
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
        {status === 'loading' && <p className="text-[14px] text-[#4b4b4b]">Verifying your email...</p>}

        {status === 'success' && (
          <>
            <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Email verified</h1>
            <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
              Your email address has been verified successfully.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Verification link invalid</h1>
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
