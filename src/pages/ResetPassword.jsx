import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'

export default function ResetPassword() {
  useSeo({ title: 'Reset Password', noindex: true })
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword })
      setDone(true)
      setTimeout(() => navigate('/signin', { replace: true }), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="flex-1 flex items-center justify-center py-[50px] px-5">
        <div className="w-full max-w-[420px] mx-auto">
          <h2 className="text-[18px] font-semibold text-black mb-[15px]">Reset Password</h2>

          {!token ? (
            <p className="text-[14px] text-[#4b4b4b]">
              This reset link is missing its token. Please use the link from your email, or{' '}
              <Link to="/forgot-password" className="font-bold text-cz-primary">
                request a new one
              </Link>
              .
            </p>
          ) : done ? (
            <p className="text-[14px] text-[#4b4b4b]">Your password has been reset. Redirecting you to sign in...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

              <div className="mb-2">
                <div className="h-[47px] rounded-[30px] border border-[#a9a9a9] bg-white overflow-hidden">
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="w-full h-full bg-transparent text-[16px] text-[#212121] placeholder-[#a9a9a9] px-5 outline-none"
                  />
                </div>
              </div>
              <div className="mb-2">
                <div className="h-[47px] rounded-[30px] border border-[#a9a9a9] bg-white overflow-hidden">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
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
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
