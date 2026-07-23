import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../api/client', () => ({
  api: { get: vi.fn() },
  resolveImageUrl: (img) => (img ? `http://cdn.test${img}` : null),
}))

import { api } from '../api/client'
import { useSiteSettingsStore, useSiteSettings } from './siteSettingsStore'

const DEFAULT_BRAND = {
  description: '',
  address: '',
  phone: '',
  email: '',
  hours: '',
  social: { facebook: '', twitter: '', instagram: '', youtube: '', whatsapp: '', tiktok: '' },
  columns: [],
  marqueeMessages: [],
}

function resetStore() {
  useSiteSettingsStore.setState({ siteName: '', logo: null, favicon: null, storeStatus: 'checking', brand: DEFAULT_BRAND })
  document.head.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove())
}

describe('siteSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  describe('init', () => {
    it('sets siteName, logo, and storeStatus "ok" on success', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.resolve({ siteName: 'Acme', logo: '/logo.png' })
        if (path === '/content/footer-brand') return Promise.resolve({})
        throw new Error(`unexpected path ${path}`)
      })

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(useSiteSettingsStore.getState().storeStatus).toBe('ok'))

      expect(useSiteSettingsStore.getState().siteName).toBe('Acme')
      expect(useSiteSettingsStore.getState().logo).toBe('/logo.png')
    })

    it('sets favicon when the response includes one', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.resolve({ siteName: 'Acme', logo: '/logo.png', favicon: '/logo-icon.png' })
        if (path === '/content/footer-brand') return Promise.resolve({})
        throw new Error(`unexpected path ${path}`)
      })

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(useSiteSettingsStore.getState().storeStatus).toBe('ok'))

      expect(useSiteSettingsStore.getState().favicon).toBe('/logo-icon.png')
    })

    it('sets storeStatus to "not-found" when the backend reports STORE_NOT_FOUND', async () => {
      const err = new Error('Store not found')
      err.code = 'STORE_NOT_FOUND'
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.reject(err)
        if (path === '/content/footer-brand') return Promise.resolve({})
        throw new Error(`unexpected path ${path}`)
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(useSiteSettingsStore.getState().storeStatus).toBe('not-found'))
      consoleSpy.mockRestore()
    })

    it('sets storeStatus to "ok" (not "not-found") on an unrelated site-settings failure', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.reject(new Error('network error'))
        if (path === '/content/footer-brand') return Promise.resolve({})
        throw new Error(`unexpected path ${path}`)
      })

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(useSiteSettingsStore.getState().storeStatus).toBe('ok'))
    })

    it('does not overwrite siteName/logo when the response omits them', async () => {
      useSiteSettingsStore.setState({ siteName: 'Existing', logo: '/existing.png' })
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.resolve({})
        if (path === '/content/footer-brand') return Promise.resolve({})
        throw new Error(`unexpected path ${path}`)
      })

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(useSiteSettingsStore.getState().storeStatus).toBe('ok'))

      expect(useSiteSettingsStore.getState().siteName).toBe('Existing')
      expect(useSiteSettingsStore.getState().logo).toBe('/existing.png')
    })

    it('merges footer-brand data over the defaults, including a shallow social merge', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.resolve({})
        if (path === '/content/footer-brand') {
          return Promise.resolve({
            description: 'We sell computers',
            social: { facebook: 'https://fb.com/acme' },
          })
        }
        throw new Error(`unexpected path ${path}`)
      })

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(useSiteSettingsStore.getState().brand.description).toBe('We sell computers'))

      const { brand } = useSiteSettingsStore.getState()
      expect(brand.social.facebook).toBe('https://fb.com/acme')
      // Unlisted social keys must survive the merge, not be nulled out by the partial response.
      expect(brand.social.twitter).toBe('')
      expect(brand.address).toBe('') // untouched default
    })

    it('logs but does not throw if the footer-brand fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      api.get.mockImplementation((path) => {
        if (path === '/content/site-settings') return Promise.resolve({})
        if (path === '/content/footer-brand') return Promise.reject(new Error('network error'))
        throw new Error(`unexpected path ${path}`)
      })

      useSiteSettingsStore.getState().init()
      await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled())

      expect(useSiteSettingsStore.getState().brand).toEqual(DEFAULT_BRAND)
      consoleSpy.mockRestore()
    })
  })

  describe('setSiteName / setLogo', () => {
    it('setSiteName updates siteName directly', () => {
      useSiteSettingsStore.getState().setSiteName('New Name')
      expect(useSiteSettingsStore.getState().siteName).toBe('New Name')
    })

    it('setLogo updates logo directly (e.g. after an admin branding save)', () => {
      useSiteSettingsStore.getState().setLogo('/new-logo.png')
      expect(useSiteSettingsStore.getState().logo).toBe('/new-logo.png')
    })
  })

  describe('favicon side-effect subscription', () => {
    it('updates the <link rel="icon"> href when logo changes to a new truthy value', () => {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = '/old-favicon.ico'
      document.head.appendChild(link)

      useSiteSettingsStore.getState().setLogo('/new-logo.png')

      expect(document.querySelector('link[rel="icon"]').getAttribute('href')).toBe('http://cdn.test/new-logo.png')
    })

    it('does not touch the favicon link when logo is set to the same value again', () => {
      useSiteSettingsStore.setState({ logo: '/logo.png' })
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = '/untouched.ico'
      document.head.appendChild(link)

      useSiteSettingsStore.getState().setLogo('/logo.png')

      expect(document.querySelector('link[rel="icon"]').getAttribute('href')).toBe('/untouched.ico')
    })

    it('does not touch the favicon link when logo changes to a falsy value', () => {
      useSiteSettingsStore.setState({ logo: '/logo.png' })
      const link = document.createElement('link')
      link.rel = 'icon'
      link.href = '/untouched.ico'
      document.head.appendChild(link)

      useSiteSettingsStore.getState().setLogo(null)

      expect(document.querySelector('link[rel="icon"]').getAttribute('href')).toBe('/untouched.ico')
    })

    it('does nothing if no <link rel="icon"> exists in the document', () => {
      expect(() => useSiteSettingsStore.getState().setLogo('/new-logo.png')).not.toThrow()
    })

    it('prefers favicon over logo when both are set', () => {
      useSiteSettingsStore.setState({ logo: '/logo.png', favicon: null })
      const link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)

      useSiteSettingsStore.getState().setFavicon('/logo-icon.png')

      expect(document.querySelector('link[rel="icon"]').getAttribute('href')).toBe('http://cdn.test/logo-icon.png')
    })

    it('falls back to logo when favicon is cleared back to null', () => {
      useSiteSettingsStore.setState({ logo: '/logo.png', favicon: '/logo-icon.png' })
      const link = document.createElement('link')
      document.head.appendChild(link)
      link.rel = 'icon'

      // Simulate a fresh logo upload that doesn't yield an icon crop, clearing the old favicon.
      useSiteSettingsStore.setState({ favicon: null })
      useSiteSettingsStore.getState().setLogo('/new-logo.png')

      expect(document.querySelector('link[rel="icon"]').getAttribute('href')).toBe('http://cdn.test/new-logo.png')
    })
  })

  describe('useSiteSettings', () => {
    it('derives logoUrl via resolveImageUrl', () => {
      useSiteSettingsStore.setState({ logo: '/logo.png' })
      const { result } = renderHook(() => useSiteSettings())
      expect(result.current.logoUrl).toBe('http://cdn.test/logo.png')
    })

    it('logoUrl is null when there is no logo', () => {
      useSiteSettingsStore.setState({ logo: null })
      const { result } = renderHook(() => useSiteSettings())
      expect(result.current.logoUrl).toBeNull()
    })
  })
})