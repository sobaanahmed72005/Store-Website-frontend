import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/client', () => ({ api: { get: vi.fn() } }))

import { api } from '../api/client'
import { useCurrencyStore, CURRENCY_CATALOG, parsePkr } from './currencyStore'

const STORAGE_KEY = 'cz_currency'

function resetStore() {
  useCurrencyStore.setState({
    currency: localStorage.getItem(STORAGE_KEY) || 'PKR',
    currencies: { PKR: { ...CURRENCY_CATALOG.PKR, rate: 1 } },
  })
}

describe('parsePkr', () => {
  it('passes a number straight through', () => {
    expect(parsePkr(65000)).toBe(65000)
  })

  it('parses a plain decimal string (as MySQL DECIMAL columns arrive over JSON)', () => {
    expect(parsePkr('65000.00')).toBe(65000)
  })

  it('strips a "Rs. " prefix and thousands separators', () => {
    expect(parsePkr('Rs. 65,000.00')).toBe(65000)
  })

  it('strips other letter-based currency prefixes like "AED "', () => {
    expect(parsePkr('AED 999.50')).toBe(999.5)
  })

  it('returns 0 for null/undefined/empty string', () => {
    expect(parsePkr(null)).toBe(0)
    expect(parsePkr(undefined)).toBe(0)
    expect(parsePkr('')).toBe(0)
  })

  it('returns 0 for a non-numeric string', () => {
    expect(parsePkr('N/A')).toBe(0)
  })

  it('handles zero correctly (not treated as falsy-empty)', () => {
    expect(parsePkr(0)).toBe(0)
    expect(parsePkr('0')).toBe(0)
  })
})

describe('currencyStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    resetStore()
  })

  describe('initial state', () => {
    it('defaults to PKR when localStorage is empty', () => {
      expect(useCurrencyStore.getState().currency).toBe('PKR')
    })
  })

  describe('setCurrency', () => {
    it('switches currency and persists it when the code is known', () => {
      useCurrencyStore.setState({
        currencies: { PKR: { ...CURRENCY_CATALOG.PKR, rate: 1 }, USD: { ...CURRENCY_CATALOG.USD, rate: 0.0036 } },
      })

      useCurrencyStore.getState().setCurrency('USD')

      expect(useCurrencyStore.getState().currency).toBe('USD')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('USD')
    })

    it('is a no-op for a currency code that is not in the currently enabled set', () => {
      useCurrencyStore.getState().setCurrency('EUR')

      expect(useCurrencyStore.getState().currency).toBe('PKR')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('init', () => {
    it('builds the enabled-currency set from settings + rates, always keeping PKR', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/currency-settings') return Promise.resolve({ enabled: ['PKR', 'USD', 'GBP'] })
        if (path === '/currency/rates') return Promise.resolve({ rates: { USD: 0.0036, GBP: 0.0028 } })
        throw new Error(`unexpected path ${path}`)
      })

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(Object.keys(useCurrencyStore.getState().currencies)).toContain('USD'))

      const { currencies } = useCurrencyStore.getState()
      expect(currencies.PKR.rate).toBe(1)
      expect(currencies.USD.rate).toBe(0.0036)
      expect(currencies.GBP.rate).toBe(0.0028)
    })

    it('excludes an enabled currency with no live rate rather than defaulting it to rate 1', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/currency-settings') return Promise.resolve({ enabled: ['PKR', 'USD', 'AED'] })
        // AED has no rate in the response at all.
        if (path === '/currency/rates') return Promise.resolve({ rates: { USD: 0.0036 } })
        throw new Error(`unexpected path ${path}`)
      })

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(Object.keys(useCurrencyStore.getState().currencies)).toContain('USD'))

      expect(useCurrencyStore.getState().currencies.AED).toBeUndefined()
    })

    it('ignores an enabled code that is not in CURRENCY_CATALOG', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/currency-settings') return Promise.resolve({ enabled: ['PKR', 'XYZ'] })
        if (path === '/currency/rates') return Promise.resolve({ rates: { XYZ: 1.2 } })
        throw new Error(`unexpected path ${path}`)
      })

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(useCurrencyStore.getState().currencies.PKR).toBeDefined())

      expect(useCurrencyStore.getState().currencies.XYZ).toBeUndefined()
    })

    it('defaults to ["PKR"] when settings.enabled is empty/missing', async () => {
      api.get.mockImplementation((path) => {
        if (path === '/content/currency-settings') return Promise.resolve({ enabled: [] })
        if (path === '/currency/rates') return Promise.resolve({ rates: {} })
        throw new Error(`unexpected path ${path}`)
      })

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(Object.keys(useCurrencyStore.getState().currencies)).toEqual(['PKR']))

      expect(useCurrencyStore.getState().currencies.PKR.rate).toBe(1)
    })

    it('falls back the selected currency to PKR if the previously-selected one is no longer enabled', async () => {
      useCurrencyStore.setState({ currency: 'USD' })
      api.get.mockImplementation((path) => {
        if (path === '/content/currency-settings') return Promise.resolve({ enabled: ['PKR'] })
        if (path === '/currency/rates') return Promise.resolve({ rates: {} })
        throw new Error(`unexpected path ${path}`)
      })

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(useCurrencyStore.getState().currency).toBe('PKR'))
    })

    it('keeps the selected currency if it is still enabled after re-init', async () => {
      useCurrencyStore.setState({ currency: 'USD' })
      api.get.mockImplementation((path) => {
        if (path === '/content/currency-settings') return Promise.resolve({ enabled: ['PKR', 'USD'] })
        if (path === '/currency/rates') return Promise.resolve({ rates: { USD: 0.0036 } })
        throw new Error(`unexpected path ${path}`)
      })

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(useCurrencyStore.getState().currencies.USD).toBeDefined())

      expect(useCurrencyStore.getState().currency).toBe('USD')
    })

    it('swallows a failed fetch and leaves the default PKR-only state intact', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      api.get.mockRejectedValue(new Error('network down'))

      useCurrencyStore.getState().init()
      await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled())

      expect(useCurrencyStore.getState().currencies).toEqual({ PKR: { ...CURRENCY_CATALOG.PKR, rate: 1 } })
      consoleSpy.mockRestore()
    })
  })

  describe('format', () => {
    it('formats a PKR amount with 0 decimals and the Rs. symbol', () => {
      expect(useCurrencyStore.getState().format(65000)).toBe('Rs. 65,000')
    })

    it('formats using the active currency rate and decimals', () => {
      useCurrencyStore.setState({
        currency: 'USD',
        currencies: { PKR: { ...CURRENCY_CATALOG.PKR, rate: 1 }, USD: { ...CURRENCY_CATALOG.USD, rate: 0.0036 } },
      })

      expect(useCurrencyStore.getState().format(65000)).toBe('$234.00')
    })

    it('accepts a DB-style decimal string as input, not just a number', () => {
      expect(useCurrencyStore.getState().format('65000.00')).toBe('Rs. 65,000')
    })

    it('falls back to PKR formatting if the active currency is missing from the catalog', () => {
      useCurrencyStore.setState({ currency: 'GBP', currencies: { PKR: { ...CURRENCY_CATALOG.PKR, rate: 1 } } })
      expect(useCurrencyStore.getState().format(1000)).toBe('Rs. 1,000')
    })

    it('formats zero correctly', () => {
      expect(useCurrencyStore.getState().format(0)).toBe('Rs. 0')
    })
  })
})
