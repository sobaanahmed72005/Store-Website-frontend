import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="flex-1 flex items-center justify-center py-[50px] px-5">
        <div className="w-full max-w-[420px] mx-auto">
          <h2 className="text-[18px] font-semibold text-black mb-[15px]">Forgot Password</h2>

          {sent ? (
            <p className="text-[14px] text-[#4b4b4b]">
              If an account with that email exists, we've sent a password reset link to it. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-[14px] text-[#4b4b4b] mb-4">
                Enter your account email and we'll send you a link to reset your password.
              </p>

              {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

              <div className="mb-2">
                <div className="h-[47px] rounded-[30px] border border-[#a9a9a9] bg-white overflow-hidden">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-full bg-transparent text-[16px] text-[#212121] placeholder-[#a9a9a9] px-5 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-[10px] px-[30px] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center text-[14px] text-black">
            <Link to="/signin" className="font-bold">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
