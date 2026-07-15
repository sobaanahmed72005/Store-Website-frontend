import { useEffect } from 'react'
import { useAuthStore } from './authStore'
import { useCurrencyStore } from './currencyStore'
import { useCategoryStore } from './categoryStore'
import { useSiteSettingsStore } from './siteSettingsStore'

// Zustand stores don't need a Provider mounted in the tree the way Context did, but the
// stores that fetch their initial data from the API still need exactly one place to kick that
// fetch off on app start — this is that place. Cart/wishlist don't need an entry here: cart
// reads its initial state synchronously from localStorage, and both cross-subscribe to
// authStore directly inside their own store modules (see cartStore.js/wishlistStore.js).
export function useBootstrapStores() {
  useEffect(() => {
    useAuthStore.getState().init()
    useCurrencyStore.getState().init()
    useCategoryStore.getState().init()
    useSiteSettingsStore.getState().init()
  }, [])
}
