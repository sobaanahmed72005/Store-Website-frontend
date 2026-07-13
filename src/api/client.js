import { rawFetch, resolveImageUrl, BASE_URL } from './http'
import { withAuthRetry, setAuthFailureHandler, scheduleTokenRefresh, cancelTokenRefresh } from './authRefresh'

// Call sites may also pass `auth: true` — accepted silently and not destructured here. It's
// purely documentation that an endpoint requires a signed-in session; every request already
// sends the httpOnly session cookie via `credentials: 'include'` below regardless, so there's
// nothing extra to gate on that flag.
async function request(path, { method = 'GET', body } = {}) {
  const doFetch = () =>
    rawFetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  const { res, data } = await withAuthRetry(doFetch)

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

  const { res, data } = await withAuthRetry(() => rawFetch(endpoint, { method: 'POST', body: formData }))
  if (!res.ok) throw new Error(data?.error || 'Upload failed')
  return data
}

export { setAuthFailureHandler, scheduleTokenRefresh, cancelTokenRefresh, resolveImageUrl, BASE_URL }
