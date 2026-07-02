import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

function AuthInput({ type = 'text', name, placeholder, value, onChange, required = true }) {
  return (
    <div className="mb-2">
      <div className="h-[47px] rounded-[30px] border border-[#a9a9a9] bg-white overflow-hidden">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full h-full bg-transparent text-[16px] text-[#212121] placeholder-[#a9a9a9] px-5 outline-none"
        />
      </div>
    </div>
  )
}

export default function SignUp() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      await register(form.name, form.email, form.password, form.phone)
      navigate('/account', { replace: true })
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
          <h2 className="text-[18px] font-semibold text-black mb-[15px]">Create an Account</h2>

          {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

          <AuthInput name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <AuthInput name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <AuthInput name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} required={false} />
          <AuthInput type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
          <AuthInput
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-[10px] px-[30px] transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>

          <div className="mt-4 text-center text-[14px] text-black">
            Already have an account?{' '}
            <Link to="/signin" className="font-bold">
              Sign In
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
