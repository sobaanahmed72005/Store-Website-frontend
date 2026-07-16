import { create } from 'zustand'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

const STORAGE_KEY = 'cz_currency'

// Display metadata only — actual conversion rates come live from the backend.
export const CURRENCY_CATALOG = {
  PKR: { symbol: 'Rs. ', decimals: 0, flag: '🇵🇰' },
  USD: { symbol: '$', decimals: 2, flag: '🇺🇸' },
  GBP: { symbol: '£', decimals: 2, flag: '🇬🇧' },
  EUR: { symbol: '€', decimals: 2, flag: '🇪🇺' },
  AED: { symbol: 'AED ', decimals: 2, flag: '🇦🇪' },
  SAR: { symbol: 'SAR ', decimals: 2, flag: '🇸🇦' },
  CAD: { symbol: 'C$', decimals: 2, flag: '🇨🇦' },
  AUD: { symbol: 'A$', decimals: 2, flag: '🇦🇺' },
}

const DEFAULT_CURRENCIES = { PKR: { ...CURRENCY_CATALOG.PKR, rate: 1 } }

function loadCurrency() {
  return localStorage.getItem(STORAGE_KEY) || 'PKR'
}

export function parsePkr(value) {
  if (typeof value === 'number') return value
  if (!value) return 0
  // Strip currency prefixes like "Rs." and thousands separators, but keep the decimal point
  // (DB prices arrive as decimal strings e.g. "65000.00").
  const stripped = value.toString().replace(/^[A-Za-z\s.]*/, '').replace(/,/g, '')
  return parseFloat(stripped) || 0
}

export const useCurrencyStore = create((set, get) => ({
  currency: loadCurrency(),
  currencies: DEFAULT_CURRENCIES,

  init: () => {
    Promise.all([api.get(ENDPOINTS.CONTENT.CURRENCY_SETTINGS), api.get(ENDPOINTS.CURRENCY.RATES)])
      .then(([settings, rateData]) => {
        const enabled = settings.enabled?.length ? settings.enabled : ['PKR']
        const next = {}
        for (const code of enabled) {
          if (!CURRENCY_CATALOG[code]) continue
          const rate = code === 'PKR' ? 1 : rateData.rates?.[code]
          // A currency with no live rate can't be displayed correctly — defaulting it to rate 1
          // would silently show a PKR-scale number under a foreign symbol (e.g. "$65000" instead
          // of the real ~$230). Leave it out of the selectable set entirely rather than guess.
          if (rate == null) continue
          next[code] = { ...CURRENCY_CATALOG[code], rate }
        }
        if (!next.PKR) next.PKR = { ...CURRENCY_CATALOG.PKR, rate: 1 }
        set((state) => ({ currencies: next, currency: next[state.currency] ? state.currency : 'PKR' }))
      })
      .catch((err) => console.error('Failed to load currency settings/rates:', err))
  },

  setCurrency: (code) => {
    if (get().currencies[code]) {
      localStorage.setItem(STORAGE_KEY, code)
      set({ currency: code })
    }
  },

  format: (pkrValue) => {
    const { currency, currencies } = get()
    const entry = currencies[currency] || currencies.PKR
    const amount = parsePkr(pkrValue) * (entry.rate ?? 1)
    return `${entry.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: entry.decimals,
      maximumFractionDigits: entry.decimals,
    })}`
  },
}))

// Whole-object compatibility hook. `format`/`setCurrency` are stable function references (they
// read from get() at call time, not from closed-over state), so this is safe for components that
// only use `format` even though it technically subscribes to the whole store.
export function useCurrency() {
  return useCurrencyStore()
}
