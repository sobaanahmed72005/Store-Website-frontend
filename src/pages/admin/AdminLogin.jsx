import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'
import TwoFactorCodeForm from '../../components/TwoFactorCodeForm'
import { ADMIN_PATH } from '../../config/adminPath'
import { useSeo } from '../../hooks/useSeo'

export default function AdminLogin() {
  useSeo({ title: 'Admin Sign In', noindex: true })
  const { login, verifyTwoFactor, logout, user, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [challengeId, setChallengeId] = useState(null)

  if (user?.role === 'admin') {
    return <Navigate to={ADMIN_PATH} replace />
  }

  const requireAdminOrReject = (loggedInUser) => {
    if (loggedInUser.role !== 'admin') {
      logout()
      setError('This account does not have admin access.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await login(form.email, form.password)
      if (data.requires2fa) {
        setChallengeId(data.challengeId)
        return
      }
      if (requireAdminOrReject(data.user)) {
        navigate(ADMIN_PATH, { replace: true })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleTwoFactorSubmit = async (code) => {
    setError('')
    try {
      const loggedInUser = await verifyTwoFactor(challengeId, code)
      if (requireAdminOrReject(loggedInUser)) {
        navigate(ADMIN_PATH, { replace: true })
      }
    } catch (err) {
      setError(err.message)
    }
  }

  if (challengeId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cz-topbar px-5">
        <Logo variant="light" textClassName="text-2xl mb-6" />
        <div className="w-full max-w-[380px] bg-white rounded-[10px] border border-[#dedede] p-8">
          <TwoFactorCodeForm onSubmit={handleTwoFactorSubmit} loading={loading} error={error} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cz-topbar px-5">
      <Logo variant="light" textClassName="text-2xl mb-6" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] bg-white rounded-[10px] border border-[#dedede] p-8"
      >
        <h1 className="text-[20px] font-semibold text-[#212121] mb-1">Admin Sign In</h1>
        <p className="text-[13px] text-[#4b4b4b] mb-5">Sign in to manage products, categories and orders.</p>

        {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

        <div className="mb-3">
          <input
            type="email"
            placeholder="Admin email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-4 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-4 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-2.5 transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
