import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { api, BASE_URL } from '../api/client'
import { useAuthStore } from './authStore'
import { getEffectivePrice, getVariantEffectivePrice } from '../utils/pricing'

const STORAGE_KEY = 'cz_cart'

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Two different variants of the same product must be separate cart lines — matching on id alone
// would collapse them into one.
function sameLine(item, id, variantId) {
  return String(item.id) === String(id) && String(item.variantId ?? '') === String(variantId ?? '')
}

export const useCartStore = create(subscribeWithSelector((set, get) => ({
  items: readStoredCart(),
  cartOpen: false,

  addToCart: (product, qty = 1) => {
    set((state) => {
      const existing = state.items.find((item) => sameLine(item, product.id, product.variantId))
      const items = existing
        ? state.items.map((item) => (sameLine(item, product.id, product.variantId) ? { ...item, qty: item.qty + qty } : item))
        : [...state.items, { ...product, qty }]
      return { items, cartOpen: true }
    })
  },

  updateQty: (id, variantId, delta) => {
    set((state) => ({
      items: state.items.map((item) => (sameLine(item, id, variantId) ? { ...item, qty: Math.max(1, item.qty + delta) } : item)),
    }))
  },

  setQty: (id, variantId, qty) => {
    set((state) => ({
      items: state.items.map((item) => (sameLine(item, id, variantId) ? { ...item, qty: Math.max(1, qty) } : item)),
    }))
  },

  removeFromCart: (id, variantId) => {
    set((state) => ({ items: state.items.filter((item) => !sameLine(item, id, variantId)) }))
  },

  clearCart: () => set({ items: [] }),

  // The server always charges the current price at checkout regardless of what the cart
  // displays, so this is a display-accuracy fix, not a security one — but a stale price shown
  // right up to checkout is a bad surprise. Call this when the cart page loads.
  refreshPrices: async () => {
    const { items } = get()
    if (items.length === 0) return { changed: [], removed: [] }

    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const product = await api.get(`/products/${item.slug}`)
          return { item, product }
        } catch {
          return { item, product: null }
        }
      })
    )

    const changed = []
    const removed = []
    const nextItems = []

    for (const { item, product } of results) {
      if (!product) {
        removed.push(item.title)
        continue
      }
      if (item.variantId != null) {
        const variant = product.variants?.find((v) => v.id === item.variantId)
        if (!variant || variant.stock <= 0) {
          removed.push(item.title)
          continue
        }
        const { price } = getVariantEffectivePrice(variant)
        if (price !== item.price) {
          changed.push({ title: item.title, from: item.price, to: price })
          nextItems.push({ ...item, price })
        } else {
          nextItems.push(item)
        }
        continue
      }
      if (product.stock <= 0) {
        removed.push(item.title)
        continue
      }
      const { price } = getEffectivePrice(product)
      if (price !== item.price) {
        changed.push({ title: item.title, from: item.price, to: price })
        nextItems.push({ ...item, price })
      } else {
        nextItems.push(item)
      }
    }

    if (changed.length > 0 || removed.length > 0) {
      set({ items: nextItems })
    }
    return { changed, removed }
  },

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
})))

useCartStore.subscribe(
  (state) => state.items,
  (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
)

// --- Server sync, driven off auth state changes instead of a component mount effect ---
// (mirrors what CartProvider's useEffect(() => {...}, [user]) used to do, but as a plain
// module-level subscription — Zustand stores don't need a component in the tree to react to
// each other).
let syncedForUserId = null

useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    if (!user) {
      syncedForUserId = null
      return
    }
    if (syncedForUserId === user.id) return
    syncedForUserId = user.id

    api
      .get(`/cart/${user.id}`, { auth: true })
      .then((serverItems) => {
        if (serverItems.length > 0) {
          useCartStore.setState({
            items: serverItems.map((row) => ({
              id: String(row.product_ref),
              variantId: row.variant_id ?? null,
              variantLabel: row.variant_label ?? null,
              slug: row.product_slug,
              title: row.product_name,
              image: row.product_image,
              price: Number(row.price),
              qty: row.quantity,
            })),
          })
        }
      })
      .catch((err) => console.error('Failed to sync cart from server:', err))
  }
)

// Debounced — without this, rapidly clicking a quantity +/- stepper fires one full-cart PUT per
// click, all racing each other with no ordering guarantee (a slow earlier request can land after
// a later one and revert the quantity server-side). Collapsing rapid changes into a single
// request after things settle avoids that almost entirely.
let syncTimer = null
let pendingSyncItems = null

useCartStore.subscribe(
  (state) => state.items,
  (items) => {
    const user = useAuthStore.getState().user
    if (!user || syncedForUserId !== user.id) return

    pendingSyncItems = items
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      api.put(`/cart/${user.id}`, { items }, { auth: true }).catch((err) => console.error('Failed to sync cart to server:', err))
      syncTimer = null
      pendingSyncItems = null
    }, 600)
  }
)

// A quantity change immediately followed by navigating away (closing the tab, clicking through
// to checkout) can otherwise beat the 600ms debounce above — the next page load's "sync cart
// FROM server" step then overwrites the correct local state with the server's now-stale copy,
// silently reverting the change with no error shown anywhere. Flushing here, as the page is
// actually being hidden/torn down, closes that window. sendBeacon (not fetch) is used because a
// normal in-flight fetch gets cancelled when the page unloads, but sendBeacon is specifically
// designed to survive it — the backend exposes a POST alongside the existing PUT for this since
// sendBeacon can only send POST.
function flushPendingCartSync() {
  if (!syncTimer || !pendingSyncItems) return
  const user = useAuthStore.getState().user
  if (!user) return
  clearTimeout(syncTimer)
  syncTimer = null
  navigator.sendBeacon(`${BASE_URL}/cart/${user.id}`, new Blob([JSON.stringify({ items: pendingSyncItems })], { type: 'application/json' }))
  pendingSyncItems = null
}

// visibilitychange is the more reliable signal (fires on tab switch/backgrounding, where a
// mobile browser may kill the page without ever emitting pagehide) — pagehide is a fallback for
// same-tab hard navigation/close, which doesn't always flip visibility first.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushPendingCartSync()
})
window.addEventListener('pagehide', flushPendingCartSync)

// Whole-object compatibility hook for pages that need most of these fields together (Cart,
// Checkout) — subscribes to every field, so prefer a selector (e.g. useCartStore(s => s.count))
// in components that render many times or stay mounted everywhere (Header, ProductCard), where
// subscribing to the whole store would re-render on every unrelated cart change.
export function useCart() {
  const state = useCartStore()
  const count = state.items.reduce((sum, item) => sum + item.qty, 0)
  const subTotal = state.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  return { ...state, count, subTotal }
}

export const useCartCount = () => useCartStore((s) => s.items.reduce((sum, item) => sum + item.qty, 0))
