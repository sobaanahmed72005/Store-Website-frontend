export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const BASE_HOSTS = ['localhost', '127.0.0.1']

function getStoreSlug() {
  const hostname = window.location.hostname.toLowerCase()
  if (BASE_HOSTS.includes(hostname)) return 'main'
  const parts = hostname.split('.')
  return parts.length > 1 ? parts[0] : 'main'
}

// Single low-level fetch + response-parse used by every call site (JSON requests and multipart
// uploads alike), so there's one place that builds headers and parses the response.
export async function rawFetch(path, { method = 'GET', headers, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'X-Store-Slug': getStoreSlug(), ...headers },
    credentials: 'include',
    body,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  // A server that mislabels a non-JSON body as application/json shouldn't crash the caller.
  const data = isJson ? await res.json().catch(() => null) : null
  return { res, data }
}

export function resolveImageUrl(image) {
  if (!image) return null
  if (/^https?:\/\//.test(image)) return image
  const origin = BASE_URL.replace(/\/api\/?$/, '')
  return `${origin}${image}`
}
