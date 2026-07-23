import { create } from 'zustand'
import { api, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

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

export const useSiteSettingsStore = create((set) => ({
  siteName: '',
  logo: null,
  favicon: null,
  storeStatus: 'checking',
  brand: DEFAULT_BRAND,

  setSiteName: (siteName) => set({ siteName }),
  setLogo: (logo) => set({ logo }),
  setFavicon: (favicon) => set({ favicon }),

  init: () => {
    api
      .get(ENDPOINTS.CONTENT.SITE_SETTINGS)
      .then((data) => {
        if (data.siteName) set({ siteName: data.siteName })
        if (data.logo) set({ logo: data.logo })
        if (data.favicon) set({ favicon: data.favicon })
        set({ storeStatus: 'ok' })
      })
      .catch((err) => {
        set({ storeStatus: err.code === 'STORE_NOT_FOUND' ? 'not-found' : 'ok' })
      })

    api
      .get(ENDPOINTS.CONTENT.FOOTER_BRAND)
      .then((data) => set({ brand: { ...DEFAULT_BRAND, ...data, social: { ...DEFAULT_BRAND.social, ...data.social } } }))
      .catch((err) => console.error('Failed to load footer brand content:', err))
  },
}))

// setLogo/setFavicon aren't just called from init — AdminBranding-style pages call them directly
// after saving, so the browser-tab icon needs to react there too, not only on the initial load.
// Prefer the dedicated favicon (a cropped-to-the-icon-mark version — see uploadHandler.js) over
// the full logo, since the full logo is often a wide icon+wordmark lockup that looks like
// illegible mush squeezed into a 16px tab icon.
useSiteSettingsStore.subscribe((state, prevState) => {
  const iconSource = state.favicon || state.logo
  const prevIconSource = prevState.favicon || prevState.logo
  if (iconSource !== prevIconSource && iconSource) {
    const link = document.querySelector('link[rel="icon"]')
    if (link) link.href = resolveImageUrl(iconSource)
  }
})

export function useSiteSettings() {
  const state = useSiteSettingsStore()
  const logoUrl = state.logo ? resolveImageUrl(state.logo) : null
  return { ...state, logoUrl }
}
