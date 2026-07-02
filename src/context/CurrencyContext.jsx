import { createContext, useContext, useEffect, useState } from 'react'
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
          next[code] = { ...CURRENCY_CATALOG[code], rate: code === 'PKR' ? 1 : rateData.rates?.[code] }
        }
        if (!next.PKR) next.PKR = { ...CURRENCY_CATALOG.PKR, rate: 1 }
        setCurrencies(next)
        if (!next[currency]) setCurrencyState('PKR')
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency)
  }, [currency])

  const setCurrency = (code) => {
    if (currencies[code]) setCurrencyState(code)
  }

  const format = (pkrValue) => {
    const entry = currencies[currency] || currencies.PKR
    const amount = parsePkr(pkrValue) * (entry.rate ?? 1)
    return `${entry.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: entry.decimals,
      maximumFractionDigits: entry.decimals,
    })}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, currencies }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}