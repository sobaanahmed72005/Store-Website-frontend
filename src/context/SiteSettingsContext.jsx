import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, resolveImageUrl } from '../api/client'

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

const SiteSettingsContext = createContext(null)
export function SiteSettingsProvider({ children }) {
  const [siteName, setSiteName] = useState('')
  const [logo, setLogo] = useState(null)
  const [storeStatus, setStoreStatus] = useState('checking')
  const [brand, setBrand] = useState(DEFAULT_BRAND)

  useEffect(() => {
    api
      .get('/content/site-settings')
      .then((data) => {
        if (data.siteName) setSiteName(data.siteName)
        if (data.logo) setLogo(data.logo)
        setStoreStatus('ok')
      })
      .catch((err) => {
        setStoreStatus(err.code === 'STORE_NOT_FOUND' ? 'not-found' : 'ok')
      })
  }, [])

  useEffect(() => {
    api
      .get('/content/footer-brand')
      .then((data) => setBrand({ ...DEFAULT_BRAND, ...data, social: { ...DEFAULT_BRAND.social, ...data.social } }))
      .catch((err) => console.error('Failed to load footer brand content:', err))
  }, [])

  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]')
    if (link && logo) link.href = resolveImageUrl(logo)
  }, [logo])

  const logoUrl = logo ? resolveImageUrl(logo) : null

  // Memoized so consumers relying on reference equality don't re-render on every unrelated
  // change elsewhere in the app — this provider wraps the whole tree.
  const value = useMemo(
    () => ({ siteName, setSiteName, logo, setLogo, logoUrl, storeStatus, brand }),
    [siteName, logo, logoUrl, storeStatus, brand]
  )

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  return ctx
}
