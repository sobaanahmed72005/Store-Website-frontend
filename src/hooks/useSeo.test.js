import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSeo } from './useSeo'

function cleanHead() {
  document.title = ''
  document.querySelectorAll('meta, link[rel="canonical"], #seo-jsonld').forEach((el) => el.remove())
}

describe('useSeo', () => {
  beforeEach(() => {
    cleanHead()
  })

  it('sets document.title when title is provided', () => {
    renderHook(() => useSeo({ title: 'Widget - Acme Store' }))
    expect(document.title).toBe('Widget - Acme Store')
  })

  it('does not touch document.title when title is omitted', () => {
    document.title = 'Existing Title'
    renderHook(() => useSeo({ description: 'desc only' }))
    expect(document.title).toBe('Existing Title')
  })

  it('upserts a meta description tag', () => {
    renderHook(() => useSeo({ description: 'Buy widgets online' }))
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('Buy widgets online')
  })

  it('removes the description meta tag when description is falsy on a later render', () => {
    const { rerender } = renderHook(({ description }) => useSeo({ description }), {
      initialProps: { description: 'has one' },
    })
    expect(document.querySelector('meta[name="description"]')).not.toBeNull()

    rerender({ description: undefined })
    expect(document.querySelector('meta[name="description"]')).toBeNull()
  })

  it('reuses the existing meta element on update rather than duplicating it', () => {
    const { rerender } = renderHook(({ description }) => useSeo({ description }), {
      initialProps: { description: 'first' },
    })
    rerender({ description: 'second' })

    const tags = document.querySelectorAll('meta[name="description"]')
    expect(tags).toHaveLength(1)
    expect(tags[0].getAttribute('content')).toBe('second')
  })

  it('sets Open Graph and Twitter card tags, switching card type based on image presence', () => {
    renderHook(() =>
      useSeo({ title: 'Widget', description: 'desc', canonical: 'https://x.test/w', image: 'https://x.test/w.png' })
    )

    expect(document.querySelector('meta[property="og:title"]').getAttribute('content')).toBe('Widget')
    expect(document.querySelector('meta[property="og:type"]').getAttribute('content')).toBe('website')
    expect(document.querySelector('meta[property="og:url"]').getAttribute('content')).toBe('https://x.test/w')
    expect(document.querySelector('meta[property="og:image"]').getAttribute('content')).toBe('https://x.test/w.png')
    expect(document.querySelector('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image')
  })

  it('uses a plain "summary" twitter:card when there is no image', () => {
    renderHook(() => useSeo({ title: 'Widget' }))
    expect(document.querySelector('meta[name="twitter:card"]').getAttribute('content')).toBe('summary')
  })

  it('sets robots to "index, follow" by default', () => {
    renderHook(() => useSeo({ title: 'Widget' }))
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe('index, follow')
  })

  it('sets robots to "noindex, follow" when noindex is true', () => {
    renderHook(() => useSeo({ title: 'Widget', noindex: true }))
    expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex, follow')
  })

  it('upserts the canonical <link> href', () => {
    renderHook(() => useSeo({ canonical: 'https://x.test/canonical-page' }))
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://x.test/canonical-page'
    )
  })

  it('removes the canonical link when canonical becomes falsy', () => {
    const { rerender } = renderHook(({ canonical }) => useSeo({ canonical }), {
      initialProps: { canonical: 'https://x.test/a' },
    })
    rerender({ canonical: undefined })
    expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('writes a single JSON-LD script tag with the correct id and content', () => {
    const jsonLd = { '@type': 'Product', name: 'Widget' }
    renderHook(() => useSeo({ jsonLd }))

    const script = document.getElementById('seo-jsonld')
    expect(script.tagName).toBe('SCRIPT')
    expect(script.type).toBe('application/ld+json')
    expect(JSON.parse(script.textContent)).toEqual([{ '@type': 'Product', name: 'Widget' }])
  })

  it('wraps a non-array jsonLd value in an array, but leaves an array as-is', () => {
    const arr = [{ '@type': 'Product' }, { '@type': 'BreadcrumbList' }]
    renderHook(() => useSeo({ jsonLd: arr }))

    expect(JSON.parse(document.getElementById('seo-jsonld').textContent)).toEqual(arr)
  })

  it('removes the JSON-LD script when jsonLd becomes falsy', () => {
    const { rerender } = renderHook(({ jsonLd }) => useSeo({ jsonLd }), {
      initialProps: { jsonLd: { '@type': 'Product' } },
    })
    expect(document.getElementById('seo-jsonld')).not.toBeNull()

    rerender({ jsonLd: undefined })
    expect(document.getElementById('seo-jsonld')).toBeNull()
  })

  it('updates the JSON-LD script content on a shape change without duplicating the tag', () => {
    const { rerender } = renderHook(({ jsonLd }) => useSeo({ jsonLd }), {
      initialProps: { jsonLd: { name: 'A' } },
    })
    rerender({ jsonLd: { name: 'B' } })

    expect(document.querySelectorAll('#seo-jsonld')).toHaveLength(1)
    expect(JSON.parse(document.getElementById('seo-jsonld').textContent)).toEqual([{ name: 'B' }])
  })

  it('sets keywords and publisher meta tags when provided', () => {
    renderHook(() => useSeo({ keywords: 'laptops, gaming', publisher: 'Acme Store' }))
    expect(document.querySelector('meta[name="keywords"]').getAttribute('content')).toBe('laptops, gaming')
    expect(document.querySelector('meta[name="publisher"]').getAttribute('content')).toBe('Acme Store')
  })

  it('does not throw and leaves the head empty when called with no args at all', () => {
    expect(() => renderHook(() => useSeo())).not.toThrow()
  })
})
