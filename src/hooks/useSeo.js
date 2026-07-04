import { useEffect } from 'react'

function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!href) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(data) {
  const id = 'seo-jsonld'
  let el = document.getElementById(id)
  if (!data) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(Array.isArray(data) ? data : [data])
}

// Manages per-page <title>, meta description, canonical link, Open Graph/Twitter
// tags, robots directive, and JSON-LD — the app has no server-side rendering, so
// this all runs client-side on mount/update (Googlebot's second indexing wave
// picks these up after JS execution).
export function useSeo({ title, description, canonical, image, noindex = false, jsonLd } = {}) {
  useEffect(() => {
    if (title) document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow')
    upsertLink('canonical', canonical)
    upsertJsonLd(jsonLd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, image, noindex, JSON.stringify(jsonLd)])
}
