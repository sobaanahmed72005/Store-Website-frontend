import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
  BASE_URL: 'http://localhost:5000/api',
}))

const { api } = await import('../api/client')
const { useCartStore } = await import('./cartStore')
const { useAuthStore } = await import('./authStore')

function resetCart() {
  useCartStore.setState({ items: [], cartOpen: false })
  useAuthStore.setState({ user: null, loading: false, initializing: false })
}

describe('cartStore', () => {
  beforeEach(() => {
    resetCart()
    vi.clearAllMocks()
  })

  describe('addToCart', () => {
    it('adds a new line for a product not already in the cart', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 2)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]).toMatchObject({ id: '1', title: 'Widget', price: 100, qty: 2 })
    })

    it('increments quantity when adding the same product+variant again', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 2)
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 3)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].qty).toBe(5)
    })

    it('keeps two different variants of the same product as separate lines', () => {
      useCartStore.getState().addToCart({ id: '1', variantId: 10, title: 'Widget - Red', price: 100 }, 1)
      useCartStore.getState().addToCart({ id: '1', variantId: 20, title: 'Widget - Blue', price: 110 }, 1)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(2)
      expect(items.map((i) => i.variantId).sort()).toEqual([10, 20])
    })

    it('opens the cart drawer when adding an item', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 1)
      expect(useCartStore.getState().cartOpen).toBe(true)
    })
  })

  describe('updateQty', () => {
    it('applies a positive delta', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 2)
      useCartStore.getState().updateQty('1', undefined, 3)
      expect(useCartStore.getState().items[0].qty).toBe(5)
    })

    it('clamps at a minimum of 1 — cannot decrement a single-quantity line to zero or below', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 1)
      useCartStore.getState().updateQty('1', undefined, -5)
      expect(useCartStore.getState().items[0].qty).toBe(1)
    })

    it('only updates the matching product+variant line', () => {
      useCartStore.getState().addToCart({ id: '1', variantId: 10, title: 'A', price: 100 }, 2)
      useCartStore.getState().addToCart({ id: '1', variantId: 20, title: 'B', price: 100 }, 2)
      useCartStore.getState().updateQty('1', 10, 1)
      const { items } = useCartStore.getState()
      expect(items.find((i) => i.variantId === 10).qty).toBe(3)
      expect(items.find((i) => i.variantId === 20).qty).toBe(2)
    })
  })

  describe('setQty', () => {
    it('sets an exact quantity', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 1)
      useCartStore.getState().setQty('1', undefined, 7)
      expect(useCartStore.getState().items[0].qty).toBe(7)
    })

    it('clamps a zero or negative quantity up to 1', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Widget', price: 100 }, 1)
      useCartStore.getState().setQty('1', undefined, 0)
      expect(useCartStore.getState().items[0].qty).toBe(1)
      useCartStore.getState().setQty('1', undefined, -3)
      expect(useCartStore.getState().items[0].qty).toBe(1)
    })
  })

  describe('removeFromCart', () => {
    it('removes only the matching line, leaving others intact', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'A', price: 100 }, 1)
      useCartStore.getState().addToCart({ id: '2', title: 'B', price: 200 }, 1)
      useCartStore.getState().removeFromCart('1', undefined)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('2')
    })
  })

  describe('clearCart', () => {
    it('empties every line', () => {
      useCartStore.getState().addToCart({ id: '1', title: 'A', price: 100 }, 1)
      useCartStore.getState().addToCart({ id: '2', title: 'B', price: 200 }, 1)
      useCartStore.getState().clearCart()
      expect(useCartStore.getState().items).toEqual([])
    })
  })

  describe('refreshPrices', () => {
    it('updates a line whose price has changed server-side and reports it', async () => {
      useCartStore.getState().addToCart({ id: '1', slug: 'widget', title: 'Widget', price: 100 }, 1)
      api.get.mockResolvedValueOnce({ price: 120, is_on_sale: false, discount_price: null, stock: 5 })

      const result = await useCartStore.getState().refreshPrices()

      expect(result.changed).toEqual([{ title: 'Widget', from: 100, to: 120 }])
      expect(result.removed).toEqual([])
      expect(useCartStore.getState().items[0].price).toBe(120)
    })

    it('removes a line whose product is now out of stock', async () => {
      useCartStore.getState().addToCart({ id: '1', slug: 'widget', title: 'Widget', price: 100 }, 1)
      api.get.mockResolvedValueOnce({ price: 100, is_on_sale: false, discount_price: null, stock: 0 })

      const result = await useCartStore.getState().refreshPrices()

      expect(result.removed).toEqual(['Widget'])
      expect(useCartStore.getState().items).toEqual([])
    })

    it('removes a line whose product no longer exists at all', async () => {
      useCartStore.getState().addToCart({ id: '1', slug: 'widget', title: 'Widget', price: 100 }, 1)
      api.get.mockRejectedValueOnce(new Error('Not found'))

      const result = await useCartStore.getState().refreshPrices()

      expect(result.removed).toEqual(['Widget'])
      expect(useCartStore.getState().items).toEqual([])
    })

    it('leaves an unchanged line alone and reports nothing', async () => {
      useCartStore.getState().addToCart({ id: '1', slug: 'widget', title: 'Widget', price: 100 }, 1)
      api.get.mockResolvedValueOnce({ price: 100, is_on_sale: false, discount_price: null, stock: 5 })

      const result = await useCartStore.getState().refreshPrices()

      expect(result.changed).toEqual([])
      expect(result.removed).toEqual([])
      expect(useCartStore.getState().items[0].price).toBe(100)
    })

    it('checks variant stock/price specifically for a variant line, not the parent product', async () => {
      useCartStore.getState().addToCart({ id: '1', variantId: 10, slug: 'widget', title: 'Widget - Red', price: 150 }, 1)
      api.get.mockResolvedValueOnce({
        stock: 5, // parent has stock, but the specific variant does not
        variants: [{ id: 10, price: 150, discount_price: null, stock: 0 }],
      })

      const result = await useCartStore.getState().refreshPrices()
      expect(result.removed).toEqual(['Widget - Red'])
    })

    it('is a no-op on an empty cart', async () => {
      const result = await useCartStore.getState().refreshPrices()
      expect(result).toEqual({ changed: [], removed: [] })
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('authStore cross-subscription', () => {
    it('merges a guest cart into the very first login without wiping it first', async () => {
      useCartStore.getState().addToCart({ id: '1', title: 'Guest Item', price: 100 }, 1)
      api.get.mockResolvedValueOnce([])

      useAuthStore.setState({ user: { id: 1, role: 'customer' } })
      await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith('/cart/1', { auth: true }))

      // Server had nothing for this (new) account, so the guest cart added before login survives.
      expect(useCartStore.getState().items).toHaveLength(1)
      expect(useCartStore.getState().items[0].title).toBe('Guest Item')
    })

    it('does not leak one signed-in account\'s cart into a different account that logs in next', async () => {
      api.get.mockResolvedValueOnce([])
      useAuthStore.setState({ user: { id: 1, role: 'customer' } })
      await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith('/cart/1', { auth: true }))
      useCartStore.getState().addToCart({ id: '1', title: 'Customer A Item', price: 100 }, 1)

      api.get.mockResolvedValueOnce([])
      useAuthStore.setState({ user: { id: 2, role: 'customer' } })

      // Customer A's item must be gone the instant the identity changes, not just after
      // customer B's (empty) server cart comes back — otherwise it briefly renders, and if
      // anything changes the cart before the fetch resolves, it would get pushed to B's account.
      expect(useCartStore.getState().items).toEqual([])
      await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith('/cart/2', { auth: true }))
    })

    it('clears a signed-in account\'s cart on logout instead of leaving it for the next visitor', async () => {
      api.get.mockResolvedValueOnce([])
      useAuthStore.setState({ user: { id: 1, role: 'customer' } })
      await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith('/cart/1', { auth: true }))
      useCartStore.getState().addToCart({ id: '1', title: 'Customer A Item', price: 100 }, 1)

      useAuthStore.setState({ user: null })

      expect(useCartStore.getState().items).toEqual([])
    })

    it('never fetches or holds a cart for an admin session', async () => {
      useAuthStore.setState({ user: { id: 9, role: 'admin' } })
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(api.get).not.toHaveBeenCalled()
      expect(useCartStore.getState().items).toEqual([])
    })

    it('clears a customer cart when the identity switches to an admin session', async () => {
      api.get.mockResolvedValueOnce([])
      useAuthStore.setState({ user: { id: 1, role: 'customer' } })
      await vi.waitFor(() => expect(api.get).toHaveBeenCalledWith('/cart/1', { auth: true }))
      useCartStore.getState().addToCart({ id: '1', title: 'Customer A Item', price: 100 }, 1)

      useAuthStore.setState({ user: { id: 9, role: 'admin' } })

      expect(useCartStore.getState().items).toEqual([])
    })
  })
})
