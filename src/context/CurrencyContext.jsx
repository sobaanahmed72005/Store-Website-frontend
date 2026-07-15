import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const CurrencyContext = createContext(null)
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

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(loadCurrency)
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES)

  useEffect(() => {
    Promise.all([api.get('/content/currency-settings'), api.get('/currency/rates')])
      .then(([settings, rateData]) => {
        const enabled = settings.enabled?.length ? settings.enabled : ['PKR']
        const next = {}
        for (const code of enabled) {
          if (!CURRENCY_CATALOG[code]) continue
          const rate = code === 'PKR' ? 1 : rateData.rates?.[code]
          // A currency with no live rate can't be displayed correctly — defaulting it to rate 1
          // would silently show a PKR-scale number under a foreign symbol (e.g. "$65000"
          // instead of the real ~$230). Leave it out of the selectable set entirely rather than
          // guess.
          if (rate == null) continue
          next[code] = { ...CURRENCY_CATALOG[code], rate }
        }
        if (!next.PKR) next.PKR = { ...CURRENCY_CATALOG.PKR, rate: 1 }
        setCurrencies(next)
        if (!next[currency]) setCurrencyState('PKR')
      })
      .catch((err) => console.error('Failed to load currency settings/rates:', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency)
  }, [currency])

  const setCurrency = useCallback(
    (code) => {
      if (currencies[code]) setCurrencyState(code)
    },
    [currencies]
  )

  const format = useCallback(
    (pkrValue) => {
      const entry = currencies[currency] || currencies.PKR
      const amount = parsePkr(pkrValue) * (entry.rate ?? 1)
      return `${entry.symbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: entry.decimals,
        maximumFractionDigits: entry.decimals,
      })}`
    },
    [currencies, currency]
  )

  // Memoized so consumers relying on reference equality don't re-render on every unrelated
  // change elsewhere in the app — this provider wraps the whole tree.
  const value = useMemo(
    () => ({ currency, setCurrency, format, currencies }),
    [currency, setCurrency, format, currencies]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}