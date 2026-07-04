import { createContext, useContext, useEffect, useState } from 'react'
import { api, resolveImageUrl } from '../api/client'

const SiteSettingsContext = createContext(null)
export function SiteSettingsProvider({ children }) {
  const [siteName, setSiteName] = useState('')
  const [logo, setLogo] = useState(null)
  const [storeStatus, setStoreStatus] = useState('checking')

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
    const link = document.querySelector('link[rel="icon"]')
    if (link && logo) link.href = resolveImageUrl(logo)
  }, [logo])

  const logoUrl = logo ? resolveImageUrl(logo) : null

  return (
    <SiteSettingsContext.Provider value={{ siteName, setSiteName, logo, setLogo, logoUrl, storeStatus }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  return ctx
}
