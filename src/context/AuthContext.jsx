import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem('cz_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('cz_user', JSON.stringify(user))
    else localStorage.removeItem('cz_user')
  }, [user])

  useEffect(() => {
    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
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
    <AuthContext.Provider value={{ user, loading, login, verifyTwoFactor, register, logout, updateSession, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
