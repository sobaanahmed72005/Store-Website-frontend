import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { api } from '../api/client'

// Session identity lives only in the httpOnly cookie + this in-memory store — nothing is
// cached in localStorage, so pages that gate on `user` (AdminRoute, Checkout, Account) must
// wait on `initializing` instead of treating a not-yet-checked user as "logged out".
export const useAuthStore = create(subscribeWithSelector((set) => ({
  user: null,
  loading: false,
  initializing: true,

  init: () => {
    api
      .get('/auth/me')
      .then((data) => set({ user: data.user }))
      .catch(() => set({ user: null }))
      .finally(() => set({ initializing: false }))
  },

  login: async (email, password, { admin = false } = {}) => {
    set({ loading: true })
    try {
      const data = await api.post(admin ? '/auth/admin-login' : '/auth/login', { email, password })
      if (!data.requires2fa) set({ user: data.user })
      return data
    } finally {
      set({ loading: false })
    }
  },

  verifyTwoFactor: async (challengeId, token) => {
    set({ loading: true })
    try {
      const data = await api.post('/auth/2fa/verify', { challengeId, token })
      set({ user: data.user })
      return data.user
    } finally {
      set({ loading: false })
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true })
    try {
      const data = await api.post('/auth/register', { name, email, password, phone })
      set({ user: data.user })
      return data.user
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    set({ user: null })
    api.post('/auth/logout', {}).catch((err) => console.error('Failed to revoke session on logout:', err))
  },

  updateSession: (nextUser) => set({ user: nextUser }),
})))

// Whole-object compatibility hook for pages that already need most of these fields together
// (SignIn, AdminLogin, Account) — subscribes to every field, so prefer a selector
// (useAuthStore(s => s.user)) in components that render many times or re-render often, where
// subscribing to the whole store would defeat the point of moving off React Context.
export function useAuth() {
  const state = useAuthStore()
  return { ...state, isAdmin: state.user?.role === 'admin' }
}
