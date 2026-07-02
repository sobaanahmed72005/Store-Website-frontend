import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { ADMIN_PATH } from '../config/adminPath'

function AuthInput({ type = 'text', name, placeholder, value, onChange }) {
  return (
    <div className="mb-2">
      <div className="h-[47px] rounded-[30px] border border-[#a9a9a9] bg-white overflow-hidden">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full h-full bg-transparent text-[16px] text-[#212121] placeholder-[#a9a9a9] px-5 outline-none"
        />
      </div>
    </div>
  )
}

export default function SignIn() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form.email, form.password)
      const redirectTo = location.state?.from || (user.role === 'admin' ? ADMIN_PATH : '/')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="flex-1 flex items-center justify-center py-[50px] px-5">
        <form onSubmit={handleSubmit} className="w-full max-w-[420px] mx-auto">
          <h2 className="text-[18px] font-semibold text-black mb-[15px]">Signin</h2>

          {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

          <AuthInput name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <AuthInput type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />

          <div className="text-right text-[13px] mb-2">
            <Link to="/forgot-password" className="text-cz-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-[10px] px-[30px] transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-4 text-center text-[14px] text-black">
            Don&apos;t have an account ?{' '}
            <Link to="/signup" className="font-bold">
              Signup
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
