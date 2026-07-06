import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

// One-time cleanup: before the switch to httpOnly cookies, this app stored the actual JWT in
// localStorage under this key. Nothing reads or writes it anymore, but localStorage has no
// expiry — any browser that used the app before that switch may still be holding the stale
// value, so this sweeps it away on load.
localStorage.removeItem('cz_token')

export function AuthProvider({ children }) {
  // Signed-in state (including admin name/email/role) is never cached client-side — it's held
  // only in memory here and re-derived from the httpOnly session cookie via /auth/me on every
  // load. `initializing` covers the gap while that first check is in flight: route guards must
  // wait for it instead of treating a not-yet-known session as "logged out", or a hard refresh
  // would briefly bounce an already-signed-in user (including an admin) to the login page.
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setInitializing(false))
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email, password })
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
    <AuthContext.Provider value={{ user, initializing, loading, login, verifyTwoFactor, register, logout, updateSession, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
