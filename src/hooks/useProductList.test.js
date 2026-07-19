import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('../api/client', () => ({ api: { get: vi.fn() } }))

import { api } from '../api/client'
import { useProductList } from './useProductList'

describe('useProductList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips fetching entirely when queryPath is null', () => {
    const { result } = renderHook(() => useProductList(null))

    expect(result.current.loading).toBe(false)
    expect(result.current.products).toEqual([])
    expect(api.get).not.toHaveBeenCalled()
  })

  it('fetches page 1 of the given query on mount', async () => {
    api.get.mockResolvedValueOnce({ products: [{ id: 1 }], totalPages: 3, total: 25 })

    const { result } = renderHook(() => useProductList('/products?category=laptops'))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.products).toEqual([{ id: 1 }])
    expect(result.current.totalPages).toBe(3)
    expect(result.current.total).toBe(25)
    expect(api.get).toHaveBeenCalledWith('/products?category=laptops&page=1')
  })

  it('uses "?" as the page separator when the query has no existing query string', async () => {
    api.get.mockResolvedValueOnce({ products: [], totalPages: 1, total: 0 })

    renderHook(() => useProductList('/products'))

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/products?page=1'))
  })

  it('refetches the next page when setPage is called, keeping the same query', async () => {
    api.get.mockResolvedValueOnce({ products: [{ id: 1 }], totalPages: 3, total: 25 })
    const { result } = renderHook(() => useProductList('/products?category=laptops'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.get.mockResolvedValueOnce({ products: [{ id: 2 }], totalPages: 3, total: 25 })
    act(() => result.current.setPage(2))

    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/products?category=laptops&page=2'))
    await waitFor(() => expect(result.current.products).toEqual([{ id: 2 }]))
  })

  it('resets to page 1 when queryPath changes (a new category/search/filter)', async () => {
    api.get.mockResolvedValueOnce({ products: [{ id: 1 }], totalPages: 5, total: 50 })
    const { result, rerender } = renderHook(({ q }) => useProductList(q), {
      initialProps: { q: '/products?category=laptops' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.get.mockResolvedValueOnce({ products: [{ id: 2 }], totalPages: 3, total: 25 })
    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))

    api.get.mockResolvedValueOnce({ products: [{ id: 9 }], totalPages: 1, total: 1 })
    rerender({ q: '/products?category=monitors' })

    await waitFor(() => expect(result.current.page).toBe(1))
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/products?category=monitors&page=1'))
    expect(result.current.products).toEqual([{ id: 9 }])
  })

  it('clears products and stops loading, resetting page to 1, when queryPath becomes null', async () => {
    api.get.mockResolvedValueOnce({ products: [{ id: 1 }], totalPages: 3, total: 25 })
    const { result, rerender } = renderHook(({ q }) => useProductList(q), {
      initialProps: { q: '/products' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    api.get.mockResolvedValueOnce({ products: [{ id: 2 }], totalPages: 3, total: 25 })
    act(() => result.current.setPage(2))
    await waitFor(() => expect(result.current.page).toBe(2))

    rerender({ q: null })

    await waitFor(() => expect(result.current.products).toEqual([]))
    expect(result.current.totalPages).toBe(1)
    expect(result.current.total).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.page).toBe(1)
  })

  it('sets error and clears products on a fetch failure', async () => {
    api.get.mockRejectedValueOnce(new Error('Request failed with status 500'))

    const { result } = renderHook(() => useProductList('/products'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Request failed with status 500')
    expect(result.current.products).toEqual([])
  })

  it('clears a prior error on a subsequent successful fetch', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'))
    const { result, rerender } = renderHook(({ q }) => useProductList(q), { initialProps: { q: '/products' } })
    await waitFor(() => expect(result.current.error).toBe('boom'))

    api.get.mockResolvedValueOnce({ products: [{ id: 1 }], totalPages: 1, total: 1 })
    rerender({ q: '/products?category=x' }) // a new query forces the refetch

    await waitFor(() => expect(result.current.products).toEqual([{ id: 1 }]))
    expect(result.current.error).toBe('')
  })
})
