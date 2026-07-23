import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { ADMIN_PATH } from '../config/adminPath'

// Session identity lives only in the httpOnly cookie + this in-memory store — nothing is
// cached in localStorage, so pages that gate on `user` (AdminRoute, Checkout, Account) must
// wait on `initializing` instead of treating a not-yet-checked user as "logged out".
export const useAuthStore = create(subscribeWithSelector((set) => ({
  user: null,
  loading: false,
  initializing: true,

  // Storefront and admin panel are the same SPA/origin, so a tab opened on the storefront still
  // carries whatever session cookie is currently valid for this browser — including one left
  // behind by an admin who is signed into the admin panel in another tab. This silent /auth/me
  // check on boot must not let that surface as "the storefront is logged in as the admin" (nav
  // greeting, checkout, orders placed under the admin's account): an admin identity is only
  // trusted here when the tab that fetched it is actually the admin panel. Explicitly signing in
  // via the admin login form (see `login` below) is unaffected — that sets `user` directly from
  // the login response, not from this check.
  init: () => {
    api
      .get(ENDPOINTS.AUTH.ME)
      .then((data) => {
        const onAdminSurface = window.location.pathname.startsWith(ADMIN_PATH)
        if (data.user.role === 'admin' && !onAdminSurface) {
          set({ user: null })
        } else {
          set({ user: data.user })
        }
      })
      .catch(() => set({ user: null }))
      .finally(() => set({ initializing: false }))
  },

  login: async (email, password, { admin = false } = {}) => {
    set({ loading: true })
    try {
      const data = await api.post(admin ? ENDPOINTS.AUTH.ADMIN_LOGIN : ENDPOINTS.AUTH.LOGIN, { email, password })
      if (!data.requires2fa) set({ user: data.user })
      return data
    } finally {
      set({ loading: false })
    }
  },

  verifyTwoFactor: async (challengeId, token) => {
    set({ loading: true })
    try {
      const data = await api.post(ENDPOINTS.AUTH.TWO_FA_VERIFY, { challengeId, token })
      set({ user: data.user })
      return data.user
    } finally {
      set({ loading: false })
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true })
    try {
      const data = await api.post(ENDPOINTS.AUTH.REGISTER, { name, email, password, phone })
      set({ user: data.user })
      return data.user
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    set({ user: null })
    api.post(ENDPOINTS.AUTH.LOGOUT, {}).catch((err) => console.error('Failed to revoke session on logout:', err))
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
