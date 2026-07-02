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
    if (!localStorage.getItem('cz_token')) return
    api
      .get('/auth/me', { auth: true })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('cz_token')
        setUser(null)
      })
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email, password })
      localStorage.setItem('cz_token', data.token)
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
      localStorage.setItem('cz_token', data.token)
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('cz_token')
    setUser(null)
  }

  const updateSession = (nextUser, token) => {
    localStorage.setItem('cz_token', token)
    setUser(nextUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateSession, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
