import { createContext, useContext, useEffect, useState } from 'react'
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
      .catch(() => {})
  }, [])

  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]')
    if (link && logo) link.href = resolveImageUrl(logo)
  }, [logo])

  const logoUrl = logo ? resolveImageUrl(logo) : null

  return (
    <SiteSettingsContext.Provider value={{ siteName, setSiteName, logo, setLogo, logoUrl, storeStatus, brand }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  return ctx
}
