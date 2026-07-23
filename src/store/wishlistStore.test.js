import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api/client', () => ({
  api: { get: vi.fn(), post: vi.fn(), del: vi.fn() },
  resolveImageUrl: (img) => (img ? `http://cdn.test${img}` : null),
}))

import { api } from '../api/client'
import { useAuthStore } from './authStore'
import { useWishlistStore, useIsWishlisted } from './wishlistStore'

const product = (overrides = {}) => ({
  id: 1,
  slug: 'widget',
  name: 'Widget',
  image: '/img/widget.png',
  price: '100.00',
  discount_price: null,
  stock: 5,
  ...overrides,
})

function resetStores() {
  useWishlistStore.setState({ items: [], wishlistOpen: false })
  useAuthStore.setState({ user: { id: 1, email: 'a@b.com' }, loading: false, initializing: false })
}

describe('wishlistStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
  })

  describe('isWishlisted', () => {
    it('is true only for an item already in the list', () => {
      useWishlistStore.setState({ items: [{ id: 5 }] })
      expect(useWishlistStore.getState().isWishlisted(5)).toBe(true)
      expect(useWishlistStore.getState().isWishlisted(6)).toBe(false)
    })
  })

  describe('toggleWishlist', () => {
    it('returns false and does nothing when there is no signed-in user', async () => {
      useAuthStore.setState({ user: null })

      const result = await useWishlistStore.getState().toggleWishlist(product())

      expect(result).toBe(false)
      expect(useWishlistStore.getState().items).toEqual([])
      expect(api.post).not.toHaveBeenCalled()
    })

    it('optimistically adds the item, opens the drawer, and posts to the server', async () => {
      api.post.mockResolvedValueOnce({})

      const result = await useWishlistStore.getState().toggleWishlist(product())

      expect(result).toBe(true)
      expect(useWishlistStore.getState().items).toHaveLength(1)
      expect(useWishlistStore.getState().items[0]).toMatchObject({ id: 1, title: 'Widget', price: 100 })
      expect(useWishlistStore.getState().wishlistOpen).toBe(true)
      expect(api.post).toHaveBeenCalledWith('/wishlist', { product_id: 1 }, { auth: true })
    })

    it('maps discount_price over price when present', async () => {
      api.post.mockResolvedValueOnce({})

      await useWishlistStore.getState().toggleWishlist(product({ discount_price: '80.00' }))

      expect(useWishlistStore.getState().items[0].price).toBe(80)
    })

    it('rolls back the optimistic add if the server request fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      api.post.mockRejectedValueOnce(new Error('network error'))

      const result = await useWishlistStore.getState().toggleWishlist(product())

      expect(result).toBe(true) // the optimistic add itself succeeded synchronously
      await vi.waitFor(() => expect(useWishlistStore.getState().items).toHaveLength(0))
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('does not clobber a newer add when rolling back a failed add (race guard)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      let rejectPost
      api.post.mockReturnValueOnce(new Promise((_, reject) => { rejectPost = reject }))

      await useWishlistStore.getState().toggleWishlist(product())
      // A background refetch replaces the optimistic entry for the same id before the POST fails.
      useWishlistStore.setState({ items: [{ id: 1, title: 'Widget (refetched)' }] })

      rejectPost(new Error('network error'))
      await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled())

      // The rollback only removes the exact optimistic entry it added, so the refetched entry
      // for the same id survives.
      expect(useWishlistStore.getState().items).toEqual([{ id: 1, title: 'Widget (refetched)' }])
      consoleSpy.mockRestore()
    })

    it('optimistically removes an already-wishlisted item and calls DELETE', async () => {
      useWishlistStore.setState({ items: [{ id: 1, title: 'Widget' }] })
      api.del.mockResolvedValueOnce({})

      const result = await useWishlistStore.getState().toggleWishlist(product())

      expect(result).toBe(true)
      expect(useWishlistStore.getState().items).toEqual([])
      expect(api.del).toHaveBeenCalledWith('/wishlist/1', { auth: true })
    })

    it('rolls back a failed removal by restoring the item', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      useWishlistStore.setState({ items: [{ id: 1, title: 'Widget' }] })
      api.del.mockRejectedValueOnce(new Error('network error'))

      await useWishlistStore.getState().toggleWishlist(product())
      await vi.waitFor(() => expect(useWishlistStore.getState().items).toHaveLength(1))

      expect(useWishlistStore.getState().items[0]).toMatchObject({ id: 1 })
      consoleSpy.mockRestore()
    })
  })

  describe('removeFromWishlist', () => {
    it('removes the item optimistically and calls DELETE', () => {
      useWishlistStore.setState({ items: [{ id: 1 }, { id: 2 }] })
      api.del.mockResolvedValueOnce({})

      useWishlistStore.getState().removeFromWishlist(1)

      expect(useWishlistStore.getState().items).toEqual([{ id: 2 }])
      expect(api.del).toHaveBeenCalledWith('/wishlist/1', { auth: true })
    })

    it('restores the removed item if the server call fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      useWishlistStore.setState({ items: [{ id: 1, title: 'Widget' }] })
      api.del.mockRejectedValueOnce(new Error('network error'))

      useWishlistStore.getState().removeFromWishlist(1)
      await vi.waitFor(() => expect(useWishlistStore.getState().items).toHaveLength(1))

      expect(useWishlistStore.getState().items[0]).toMatchObject({ id: 1, title: 'Widget' })
      consoleSpy.mockRestore()
    })

    it('is a safe no-op (no restore) if the item was never in the list to begin with', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      useWishlistStore.setState({ items: [] })
      api.del.mockRejectedValueOnce(new Error('404'))

      useWishlistStore.getState().removeFromWishlist(999)
      await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled())

      expect(useWishlistStore.getState().items).toEqual([])
      consoleSpy.mockRestore()
    })
  })

  describe('openWishlist / closeWishlist', () => {
    it('toggle the wishlistOpen flag', () => {
      useWishlistStore.getState().openWishlist()
      expect(useWishlistStore.getState().wishlistOpen).toBe(true)
      useWishlistStore.getState().closeWishlist()
      expect(useWishlistStore.getState().wishlistOpen).toBe(false)
    })
  })

  describe('authStore cross-subscription', () => {
    it('clears the wishlist when the user logs out', async () => {
      useWishlistStore.setState({ items: [{ id: 1 }] })

      useAuthStore.setState({ user: null })

      await vi.waitFor(() => expect(useWishlistStore.getState().items).toEqual([]))
    })

    it('fetches and maps the wishlist when a user logs in', async () => {
      useAuthStore.setState({ user: null })
      await vi.waitFor(() => expect(useWishlistStore.getState().items).toEqual([]))

      api.get.mockResolvedValueOnce([product({ id: 7 })])
      useAuthStore.setState({ user: { id: 1, role: 'customer' } })

      await vi.waitFor(() => expect(useWishlistStore.getState().items).toHaveLength(1))
      expect(useWishlistStore.getState().items[0]).toMatchObject({ id: 7, title: 'Widget' })
      expect(api.get).toHaveBeenCalledWith('/wishlist', { auth: true })
    })

    it('clears the wishlist if the post-login fetch fails', async () => {
      useAuthStore.setState({ user: null })
      await vi.waitFor(() => expect(useWishlistStore.getState().items).toEqual([]))

      useWishlistStore.setState({ items: [{ id: 999 }] }) // stale leftover, should be wiped
      api.get.mockRejectedValueOnce(new Error('unauthorized'))
      useAuthStore.setState({ user: { id: 1, role: 'customer' } })

      await vi.waitFor(() => expect(useWishlistStore.getState().items).toEqual([]))
    })

    it('never fetches a wishlist for an admin session, and clears any leftover items', async () => {
      useWishlistStore.setState({ items: [{ id: 1 }] })

      useAuthStore.setState({ user: { id: 9, role: 'admin' } })

      expect(useWishlistStore.getState().items).toEqual([])
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe('useWishlist / useIsWishlisted', () => {
    it('useIsWishlisted selector reflects membership without needing the whole store', async () => {
      const { renderHook } = await import('@testing-library/react')
      useWishlistStore.setState({ items: [{ id: 42 }] })

      const { result } = renderHook(() => useIsWishlisted(42))
      expect(result.current).toBe(true)

      const { result: result2 } = renderHook(() => useIsWishlisted(43))
      expect(result2.current).toBe(false)
    })
  })
})
