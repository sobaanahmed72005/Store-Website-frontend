import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthFailureHandler, scheduleTokenRefresh, cancelTokenRefresh } from '../api/client'

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

  // Keeps the proactive access-token refresh timer (client.js) in lockstep with whether a
  // session is actually active, instead of every call site remembering to manage it separately.
  // expiresAt is the accessTokenExpiresAt the backend returns alongside the user on every
  // endpoint that issues a session.
  const applyUser = (nextUser, expiresAt) => {
    setUser(nextUser)
    if (nextUser) scheduleTokenRefresh(expiresAt)
    else cancelTokenRefresh()
  }

  useEffect(() => {
    api
      .get('/auth/me')
      .then((data) => applyUser(data.user, data.accessTokenExpiresAt))
      .catch(() => applyUser(null))
      .finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    setAuthFailureHandler(() => applyUser(null))
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email, password })
      if (!data.requires2fa) applyUser(data.user, data.accessTokenExpiresAt)
      return data
    } finally {
      setLoading(false)
    }
  }

  const verifyTwoFactor = async (challengeId, token) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/2fa/verify', { challengeId, token })
      applyUser(data.user, data.accessTokenExpiresAt)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, phone) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/register', { name, email, password, phone })
      applyUser(data.user, data.accessTokenExpiresAt)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    applyUser(null)
    api.post('/auth/logout', {}).catch(() => {})
  }

  const updateSession = (nextUser, expiresAt) => {
    applyUser(nextUser, expiresAt)
  }

  return (
    <AuthContext.Provider value={{ user, initializing, loading, login, verifyTwoFactor, register, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
