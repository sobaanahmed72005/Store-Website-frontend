import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

const prefetchedUrls = new Set()
const hoverTimers = new Map()

export function prefetchUrl(url) {
  if (!url || prefetchedUrls.has(url)) return
  prefetchedUrls.add(url)
  api.get(url).catch(() => {
    prefetchedUrls.delete(url)
  })
}

export function handleHoverPrefetch(url, delay = 150) {
  if (!url || prefetchedUrls.has(url)) return () => {}

  const timer = setTimeout(() => {
    prefetchUrl(url)
    hoverTimers.delete(url)
  }, delay)

  hoverTimers.set(url, timer)

  return () => {
    if (hoverTimers.has(url)) {
      clearTimeout(hoverTimers.get(url))
      hoverTimers.delete(url)
    }
  }
}

export function prefetchCategory(slug) {
  if (!slug) return
  prefetchUrl(ENDPOINTS.CATEGORIES.BY_SLUG(slug))
  prefetchUrl(ENDPOINTS.PRODUCTS.LIST(`?category=${slug}`))
}

export function prefetchProduct(slug) {
  if (!slug) return
  prefetchUrl(ENDPOINTS.PRODUCTS.BY_SLUG(slug))
}
