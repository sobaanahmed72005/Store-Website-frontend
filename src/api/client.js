const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const BASE_HOSTS = ['localhost', '127.0.0.1']

function getStoreSlug() {
  const hostname = window.location.hostname.toLowerCase()
  if (BASE_HOSTS.includes(hostname)) return 'main'
  const parts = hostname.split('.')
  return parts.length > 1 ? parts[0] : 'main'
}

function getToken() {
  return localStorage.getItem('cz_token')
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'X-Store-Slug': getStoreSlug() }
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
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

export async function uploadImage(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('image', file)

  const headers = { 'X-Store-Slug': getStoreSlug() }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/admin/upload`, {
    method: 'POST',
    headers,
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
