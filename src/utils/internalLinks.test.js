import { describe, it, expect } from 'vitest'
import { resolveInternalPath } from './internalLinks'

describe('resolveInternalPath', () => {
  describe('non-internal / invalid input', () => {
    it('returns null for a falsy href', () => {
      expect(resolveInternalPath('')).toBeNull()
      expect(resolveInternalPath(null)).toBeNull()
      expect(resolveInternalPath(undefined)).toBeNull()
    })

    it('returns null for an unparsable URL', () => {
      expect(resolveInternalPath('http://[::not-valid')).toBeNull()
    })

    it('returns null for an external host not in the known hostname set', () => {
      expect(resolveInternalPath('https://example.com/products')).toBeNull()
      expect(resolveInternalPath('https://evil.com/')).toBeNull()
    })
  })

  describe('already-internal passthrough', () => {
    it('returns a /category/* path as-is', () => {
      expect(resolveInternalPath('/category/laptops')).toBe('/category/laptops')
    })

    it('returns a /product/* path as-is', () => {
      expect(resolveInternalPath('/product/some-widget')).toBe('/product/some-widget')
    })

    it('works with a full URL on a known hostname too', () => {
      expect(resolveInternalPath('https://czone.com.pk/category/monitors')).toBe('/category/monitors')
    })
  })

  describe('exact route table matches', () => {
    it('maps the homepage', () => {
      expect(resolveInternalPath('/')).toBe('/')
    })

    it('maps /products to /shop', () => {
      expect(resolveInternalPath('/products')).toBe('/shop')
    })

    it('maps auth-adjacent legacy routes', () => {
      expect(resolveInternalPath('/signin')).toBe('/signin')
      expect(resolveInternalPath('/forgotpassword')).toBe('/signin')
    })

    it('maps /orderlist to /account', () => {
      expect(resolveInternalPath('/orderlist')).toBe('/account')
    })

    it('maps a numbered legacy .aspx category page to its modern category slug', () => {
      expect(resolveInternalPath('/laptops-pakistan-ppt.74.aspx')).toBe('/laptops')
      expect(resolveInternalPath('/graphic-cards-pakistan-ppt.154.aspx')).toBe('/category/gpu')
    })

    it('maps a couple of the "no shared prefix rule" standalone collection pages', () => {
      expect(resolveInternalPath('/motherboards-pakistan-ppt.157.aspx')).toBe('/category/motherboards')
      expect(resolveInternalPath('/ups-pakistan-ppt.132.aspx')).toBe('/category/ups')
    })

    it('maps a modern-slug legacy alias route', () => {
      expect(resolveInternalPath('/cable-management')).toBe('/category/peripherals')
      expect(resolveInternalPath('/enterprise-networking')).toBe('/category/network')
    })

    it('works when given a full absolute URL rather than a bare path', () => {
      expect(resolveInternalPath('https://www.czone.com.pk/products')).toBe('/shop')
    })

    it('ignores query string / hash when matching the exact route table', () => {
      expect(resolveInternalPath('/products?ref=email')).toBe('/shop')
      expect(resolveInternalPath('/cart#top')).toBe('/cart')
    })
  })

  describe('prefix-rule matches (brand/sub-category variants)', () => {
    it('rolls a brand-specific laptop page up to /laptops', () => {
      expect(resolveInternalPath('/laptops-dell-laptops-pakistan-pt.75.aspx')).toBe('/laptops')
    })

    it('rolls a brand-specific GPU page up to /category/gpu', () => {
      expect(resolveInternalPath('/graphic-cards-nvidia-pakistan-ppt.999.aspx')).toBe('/category/gpu')
    })

    it('rolls a brand-specific PSU page up to /category/psu', () => {
      expect(resolveInternalPath('/power-supply-corsair-pakistan-ppt.500.aspx')).toBe('/category/psu')
    })
  })

  describe('regex-derived fallback (unlisted legacy path)', () => {
    it('derives a /category/<slug> from an unmapped -pakistan-ppt.N.aspx path', () => {
      expect(resolveInternalPath('/some-new-widget-pakistan-ppt.9999.aspx')).toBe('/category/some-new-widget')
    })

    it('derives a /category/<slug> from an unmapped -pakistan-pt.N.aspx path', () => {
      expect(resolveInternalPath('/some-new-widget-pakistan-pt.9999.aspx')).toBe('/category/some-new-widget')
    })

    it('derives a /category/<slug> from a bare unmapped .aspx path', () => {
      expect(resolveInternalPath('/legacy-page.aspx')).toBe('/category/legacy-page')
    })

    it('derives a /category/<slug> from a totally unmapped plain path', () => {
      expect(resolveInternalPath('/some-random-unmapped-path')).toBe('/category/some-random-unmapped-path')
    })
  })

  describe('current-hostname handling', () => {
    it('treats the current window hostname as internal too (jsdom default: localhost)', () => {
      expect(resolveInternalPath('http://localhost/products')).toBe('/shop')
    })
  })
})
