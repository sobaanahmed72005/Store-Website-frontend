import { API_URL } from '../config/env'

const BASE_URL = API_URL

const BASE_HOSTS = ['localhost', '127.0.0.1']

function getStoreSlug() {
  const hostname = window.location.hostname.toLowerCase()
  if (BASE_HOSTS.includes(hostname)) return 'main'
  const parts = hostname.split('.')
  return parts.length > 1 ? parts[0] : 'main'
}

// Access tokens are short-lived (15 minutes) by design — logout/password-change/2FA-disable can
// revoke one immediately (see the backend's sessionRevocation.js), so a long-lived token would
// undermine that. The backend already exposes a working POST /auth/refresh that silently mints a
// new access token from the httpOnly refresh cookie, but nothing was ever calling it — so once
// 15 minutes passed, every request just failed with 401 until the user manually reloaded or
// signed in again, even though their actual session (the refresh cookie) was still valid.
let refreshPromise = null

// Shared across every concurrent 401 (e.g. a debounced cart sync and an order-history fetch
// both landing right at token expiry) so a burst of requests triggers one refresh call, not one
// per request — the backend's own refresh-rotation grace window (see authController.js) exists
// for the same reason, this just avoids the redundant round-trips on top of it.
function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'X-Store-Slug': getStoreSlug() },
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Session-establishment/teardown endpoints must surface their own 401 as-is: retrying /auth/refresh
// after it 401s would recurse, and a 401 from a login attempt means "wrong credentials", not
// "expired token" — there's no session yet to refresh.
const NO_REFRESH_RETRY_PREFIXES = ['/auth/refresh', '/auth/login', '/auth/admin-login', '/auth/register', '/auth/logout', '/auth/2fa']

// requireAuth on the backend rejects an unauthenticated request before it ever reaches the
// route's actual handler (see middleware/auth.js) — so a 401 here means the original attempt
// never touched the database, and retrying once after a successful refresh can't double-submit
// a mutation.
async function fetchWithAuthRetry(path, fetchOptions, isRetry = false) {
  const res = await fetch(`${BASE_URL}${path}`, fetchOptions)
  if (res.status === 401 && !isRetry && !NO_REFRESH_RETRY_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    const refreshed = await refreshSession()
    if (refreshed) return fetchWithAuthRetry(path, fetchOptions, true)
  }
  return res
}

// Call sites may also pass `auth: true` — accepted silently and not destructured here. It's
// purely documentation that an endpoint requires a signed-in session; every request already
// sends the httpOnly session cookie via `credentials: 'include'` below regardless, so there's
// nothing extra to gate on that flag.
async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'X-Store-Slug': getStoreSlug() }
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetchWithAuthRetry(path, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed with status ${res.status}`)
    if (res.status === 404 && data?.error === 'Store not found') error.code = 'STORE_NOT_FOUND'
    throw error
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

export async function uploadImage(file, endpoint = '/admin/upload') {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetchWithAuthRetry(endpoint, {
    method: 'POST',
    headers: { 'X-Store-Slug': getStoreSlug() },
    credentials: 'include',
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Upload failed')
  return data
}

export async function uploadVideo(file, endpoint = '/admin/upload-video') {
  const formData = new FormData()
  formData.append('video', file)

  const res = await fetchWithAuthRetry(endpoint, {
    method: 'POST',
    headers: { 'X-Store-Slug': getStoreSlug() },
    credentials: 'include',
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'Upload failed')
  return data
}

export function resolveImageUrl(image) {
  if (!image) return null
  if (/^https?:\/\//.test(image)) return image
  const origin = BASE_URL.replace(/\/api\/?$/, '')
  return `${origin}${image}`
}

export { BASE_URL }
