const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const BASE_HOSTS = ['localhost', '127.0.0.1']

function getStoreSlug() {
  const hostname = window.location.hostname.toLowerCase()
  if (BASE_HOSTS.includes(hostname)) return 'main'
  const parts = hostname.split('.')
  return parts.length > 1 ? parts[0] : 'main'
}

async function rawFetch(path, { method = 'GET', body } = {}) {
  const headers = { 'X-Store-Slug': getStoreSlug() }
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null
  return { res, data }
}

// The access token cookie is short-lived (15 min); the refresh token cookie lasts 7 days. When a
// request comes back 401 TOKEN_EXPIRED, we call /auth/refresh (which silently sets a fresh access
// token cookie) and retry the original request once. requestPromise is a singleton so concurrent
// requests that expire around the same time share one in-flight refresh instead of each firing
// their own.
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = rawFetch('/auth/refresh', { method: 'POST' })
      .then(({ res }) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

let authFailureHandler = null

// Lets AuthContext register itself to clear the signed-in user once a request turns out to be
// genuinely unauthenticated (as opposed to just needing a token refresh). Existing route guards
// (AdminRoute, Checkout, Account, etc.) already redirect to sign-in whenever `user` is null, so
// clearing it here is enough on its own — no separate redirect logic needed.
export function setAuthFailureHandler(handler) {
  authFailureHandler = handler
}

async function withAuthRetry(doFetch) {
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

// Call sites may also pass `auth: true` — accepted silently and not destructured here. It's
// purely documentation that an endpoint requires a signed-in session; every request already
// sends the httpOnly session cookie via `credentials: 'include'` below regardless, so there's
// nothing extra to gate on that flag.
async function request(path, options = {}) {
  const { res, data } = await withAuthRetry(() => rawFetch(path, options))

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
  const doFetch = async () => {
    const formData = new FormData()
    formData.append('image', file)
    const headers = { 'X-Store-Slug': getStoreSlug() }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const data = isJson ? await res.json() : null
    return { res, data }
  }

  const { res, data } = await withAuthRetry(doFetch)
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
