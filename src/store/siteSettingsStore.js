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
  storeStatus: 'checking',
  brand: DEFAULT_BRAND,

  setSiteName: (siteName) => set({ siteName }),
  setLogo: (logo) => set({ logo }),

  init: () => {
    api
      .get(ENDPOINTS.CONTENT.SITE_SETTINGS)
      .then((data) => {
        if (data.siteName) set({ siteName: data.siteName })
        if (data.logo) set({ logo: data.logo })
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

// setLogo isn't just called from init — AdminBranding-style pages call it directly after
// saving, so the favicon needs to react there too, not only on the initial load.
useSiteSettingsStore.subscribe((state, prevState) => {
  if (state.logo !== prevState.logo && state.logo) {
    const link = document.querySelector('link[rel="icon"]')
    if (link) link.href = resolveImageUrl(state.logo)
  }
})

export function useSiteSettings() {
  const state = useSiteSettingsStore()
  const logoUrl = state.logo ? resolveImageUrl(state.logo) : null
  return { ...state, logoUrl }
}
