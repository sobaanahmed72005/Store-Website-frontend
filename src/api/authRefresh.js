import { rawFetch } from './http'

// The access token cookie is short-lived (15 min, matching ACCESS_TOKEN_MAX_AGE in the backend's
// utils/authCookies.js); the refresh token cookie lasts 7 days. When a request comes back 401
// TOKEN_EXPIRED, we call /auth/refresh (which silently sets a fresh access token cookie) and
// retry the original request once. refreshPromise is a singleton so concurrent requests that
// expire around the same time share one in-flight refresh instead of each firing their own.
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = rawFetch('/auth/refresh', { method: 'POST' })
      .then(({ res, data }) => {
        if (res.ok) scheduleTokenRefresh(data?.accessTokenExpiresAt)
        return res.ok
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const REFRESH_LEAD_MS = 60 * 1000 // refresh a minute before the access token actually expires

let refreshTimer = null

// Proactively refreshes the access token shortly before it expires, so a signed-in user's
// requests don't have to eat the extra 401-then-retry round trip from withAuthRetry below. That
// reactive path stays in place as a fallback (e.g. the timer can't fire while the tab is
// suspended/asleep) — this is just an optimization on top of it.
//
// expiresAt is the accessTokenExpiresAt timestamp (ms) the backend returns from every endpoint
// that issues a session (login, refresh, /auth/me, ...) — there's no client-side guess at the
// token's TTL to keep in sync with the backend's.
export function scheduleTokenRefresh(expiresAt) {
  clearTimeout(refreshTimer)
  if (!expiresAt) return
  const delay = Math.max(0, expiresAt - Date.now() - REFRESH_LEAD_MS)
  refreshTimer = setTimeout(() => {
    refreshAccessToken()
  }, delay)
}

export function cancelTokenRefresh() {
  clearTimeout(refreshTimer)
  refreshTimer = null
}

let authFailureHandler = null

// Lets AuthContext register itself to clear the signed-in user once a request turns out to be
// genuinely unauthenticated (as opposed to just needing a token refresh). Existing route guards
// (AdminRoute, Checkout, Account, etc.) already redirect to sign-in whenever `user` is null, so
// clearing it here is enough on its own — no separate redirect logic needed.
export function setAuthFailureHandler(handler) {
  authFailureHandler = handler
}

// Wraps a single fetch attempt with the 401 TOKEN_EXPIRED retry-once dance described above.
export async function withAuthRetry(doFetch) {
  let { res, data } = await doFetch()

  if (res.status === 401 && data?.code === 'TOKEN_EXPIRED') {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      ;({ res, data } = await doFetch())
    }
  }

  if (res.status === 401) authFailureHandler?.()
  return { res, data }
}
