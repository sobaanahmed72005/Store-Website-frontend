import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  // True until the initial /auth/me check resolves. Session identity now lives only in the
  // httpOnly cookie + this in-memory state — nothing is cached in localStorage, so pages that
  // gate on `user` (AdminRoute, Checkout, Account) must wait for this instead of treating a
  // not-yet-checked user as "logged out" and redirecting away.
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setInitializing(false))
  }, [])

  const login = async (email, password, { admin = false } = {}) => {
    setLoading(true)
    try {
      const data = await api.post(admin ? '/auth/admin-login' : '/auth/login', { email, password })
      if (!data.requires2fa) setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }

  const verifyTwoFactor = async (challengeId, token) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/2fa/verify', { challengeId, token })
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, phone) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/register', { name, email, password, phone })
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    api.post('/auth/logout', {}).catch(() => {})
  }

  const updateSession = (nextUser) => {
    setUser(nextUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, initializing, login, verifyTwoFactor, register, logout, updateSession, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
