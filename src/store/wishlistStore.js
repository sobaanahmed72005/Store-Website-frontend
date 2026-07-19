import { create } from 'zustand'
import { api, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useAuthStore } from './authStore'

function mapItem(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    image: resolveImageUrl(p.image),
    price: Number(p.discount_price ?? p.price),
    stock: p.stock,
  }
}

export const useWishlistStore = create((set, get) => ({
  items: [],
  wishlistOpen: false,

  isWishlisted: (productId) => get().items.some((item) => item.id === productId),

  // These update local state optimistically before the request resolves, so a failure has to be
  // rolled back explicitly — otherwise the UI keeps showing an add/remove that never actually
  // happened server-side (silently reverting itself on the next real fetch, with no indication
  // to the customer of why).
  toggleWishlist: async (product) => {
    const user = useAuthStore.getState().user
    if (!user) return false

    if (get().isWishlisted(product.id)) {
      set((state) => ({ items: state.items.filter((item) => item.id !== product.id) }))
      api.del(ENDPOINTS.WISHLIST.BY_PRODUCT_ID(product.id), { auth: true }).catch((err) => {
        console.error('Failed to remove from wishlist:', err)
        set((state) => (state.items.some((item) => item.id === product.id) ? state : { items: [mapItem(product), ...state.items] }))
      })
    } else {
      const optimisticItem = mapItem(product)
      set((state) => ({ items: [optimisticItem, ...state.items], wishlistOpen: true }))
      api.post(ENDPOINTS.WISHLIST.BASE, { product_id: product.id }, { auth: true }).catch((err) => {
        console.error('Failed to add to wishlist:', err)
        // Only undo the exact optimistic entry this call added — a same-id item currently in the
        // list is not necessarily this one (e.g. a background wishlist refetch already replaced
        // it), and removing by id alone would wipe out that fresher state instead.
        set((state) => ({ items: state.items.filter((item) => item !== optimisticItem) }))
      })
    }
    return true
  },

  removeFromWishlist: (productId) => {
    const removed = get().items.find((item) => item.id === productId)
    set((state) => ({ items: state.items.filter((item) => item.id !== productId) }))
    api.del(ENDPOINTS.WISHLIST.BY_PRODUCT_ID(productId), { auth: true }).catch((err) => {
      console.error('Failed to remove from wishlist:', err)
      if (removed) set((state) => (state.items.some((item) => item.id === productId) ? state : { items: [removed, ...state.items] }))
    })
  },

  openWishlist: () => set({ wishlistOpen: true }),
  closeWishlist: () => set({ wishlistOpen: false }),
}))

useAuthStore.subscribe(
  (state) => state.user,
  async (user) => {
    if (!user) {
      useWishlistStore.setState({ items: [] })
      return
    }
    try {
      const rows = await api.get(ENDPOINTS.WISHLIST.BASE, { auth: true })
      useWishlistStore.setState({ items: rows.map(mapItem) })
    } catch {
      useWishlistStore.setState({ items: [] })
    }
  }
)

// Whole-object compatibility hook for pages that need most of these fields together (Account) —
// prefer useIsWishlisted(id) or a selector in components that render many times (ProductCard),
// where subscribing to the whole store would re-render on every unrelated wishlist change.
export function useWishlist() {
  const state = useWishlistStore()
  return { ...state, count: state.items.length }
}

export const useIsWishlisted = (productId) => useWishlistStore((s) => s.items.some((item) => item.id === productId))
