import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../api/client', () => ({ api: { get: vi.fn() } }))

import { api } from '../api/client'
import { useCategoryStore, useCategories } from './categoryStore'

function resetStore() {
  useCategoryStore.setState({ tree: [], loading: true })
}

describe('categoryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  describe('init', () => {
    it('loads the category tree and clears loading on success', async () => {
      const tree = [{ id: 1, name: 'Laptops', show_in_nav: true, show_in_icons: false }]
      api.get.mockResolvedValueOnce(tree)

      useCategoryStore.getState().init()
      await vi.waitFor(() => expect(useCategoryStore.getState().loading).toBe(false))

      expect(useCategoryStore.getState().tree).toEqual(tree)
      expect(api.get).toHaveBeenCalledWith('/categories/tree')
    })

    it('falls back to an empty tree and clears loading on failure', async () => {
      api.get.mockRejectedValueOnce(new Error('network error'))

      useCategoryStore.getState().init()
      await vi.waitFor(() => expect(useCategoryStore.getState().loading).toBe(false))

      expect(useCategoryStore.getState().tree).toEqual([])
    })
  })

  describe('useCategories', () => {
    it('splits the tree into nav and icon subsets independently', () => {
      useCategoryStore.setState({
        tree: [
          { id: 1, name: 'Laptops', show_in_nav: true, show_in_icons: true },
          { id: 2, name: 'Monitors', show_in_nav: true, show_in_icons: false },
          { id: 3, name: 'Cables', show_in_nav: false, show_in_icons: true },
          { id: 4, name: 'Hidden', show_in_nav: false, show_in_icons: false },
        ],
        loading: false,
      })

      const { result } = renderHook(() => useCategories())

      expect(result.current.navCategories.map((c) => c.id)).toEqual([1, 2])
      expect(result.current.iconCategories.map((c) => c.id)).toEqual([1, 3])
      expect(result.current.loading).toBe(false)
    })

    it('returns empty subsets for an empty tree', () => {
      useCategoryStore.setState({ tree: [], loading: false })

      const { result } = renderHook(() => useCategories())

      expect(result.current.navCategories).toEqual([])
      expect(result.current.iconCategories).toEqual([])
    })
  })
})
