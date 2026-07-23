import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { ADMIN_PATH } from '../config/adminPath'

// Session identity lives only in the httpOnly cookie + this in-memory store — nothing is
// cached in localStorage, so pages that gate on `user` (AdminRoute, Checkout, Account) must
// wait on `initializing` instead of treating a not-yet-checked user as "logged out".
export const useAuthStore = create(subscribeWithSelector((set, get) => ({
  user: null,
  loading: false,
  initializing: true,

  // Storefront and admin panel share one SPA/origin but now carry entirely separate session
  // cookies (see the backend's utils/authCookies.js) — /auth/me only ever reads the customer
  // cookie, /auth/admin/me only ever reads the admin one, so each surface's boot-time "am I
  // logged in" check can only ever see its own identity, never the other tab's. Which one to
  // call is decided purely by the current URL, same as the equivalent decision in api/client.js's
  // 401 refresh retry. Explicitly signing in via the admin login form (see `login` below) is
  // unaffected — that sets `user` directly from the login response, not from this check.
  init: () => {
    const onAdminSurface = window.location.pathname.startsWith(ADMIN_PATH)
    api
      .get(onAdminSurface ? ENDPOINTS.AUTH.ADMIN_ME : ENDPOINTS.AUTH.ME)
      .then((data) => set({ user: data.user }))
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
    // Revoke through whichever endpoint matches the identity actually signed in — an admin's
    // session lives in the admin cookie/session record, so it has to be revoked via
    // admin-logout; posting to the customer /auth/logout wouldn't touch it at all.
    const endpoint = get().user?.role === 'admin' ? ENDPOINTS.AUTH.ADMIN_LOGOUT : ENDPOINTS.AUTH.LOGOUT
    set({ user: null })
    api.post(endpoint, {}).catch((err) => console.error('Failed to revoke session on logout:', err))
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
