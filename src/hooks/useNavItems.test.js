import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../store/categoryStore', () => ({ useCategories: vi.fn() }))

import { useCategories } from '../store/categoryStore'
import { useNavItems } from './useNavItems'

describe('useNavItems', () => {
  it('always leads with the fixed Home and Products entries', () => {
    useCategories.mockReturnValue({ navCategories: [] })

    const { result } = renderHook(() => useNavItems())

    expect(result.current[0]).toEqual({ label: 'Home', to: '/' })
    expect(result.current[1]).toEqual({ label: 'Products', to: '/products', hasDropdown: true })
  })

  it('appends nav categories sorted by sort_order', () => {
    useCategories.mockReturnValue({
      navCategories: [
        { name: 'Monitors', slug: 'monitors', sort_order: 2, subcategories: [] },
        { name: 'Laptops', slug: 'laptops', sort_order: 1, subcategories: [] },
      ],
    })

    const { result } = renderHook(() => useNavItems())

    expect(result.current.slice(2).map((i) => i.label)).toEqual(['Laptops', 'Monitors'])
  })

  it('breaks a sort_order tie alphabetically by name', () => {
    useCategories.mockReturnValue({
      navCategories: [
        { name: 'Zebra Cables', slug: 'zebra', sort_order: 1, subcategories: [] },
        { name: 'Alpha Cables', slug: 'alpha', sort_order: 1, subcategories: [] },
      ],
    })

    const { result } = renderHook(() => useNavItems())

    expect(result.current.slice(2).map((i) => i.label)).toEqual(['Alpha Cables', 'Zebra Cables'])
  })

  it('does not mutate the original navCategories array while sorting', () => {
    const original = [
      { name: 'B', slug: 'b', sort_order: 2, subcategories: [] },
      { name: 'A', slug: 'a', sort_order: 1, subcategories: [] },
    ]
    useCategories.mockReturnValue({ navCategories: original })

    renderHook(() => useNavItems())

    expect(original[0].name).toBe('B') // unchanged order in the source array
  })

  it('maps slug through categorySlugToPath (laptops gets its standalone legacy route)', () => {
    useCategories.mockReturnValue({
      navCategories: [{ name: 'Laptops', slug: 'laptops', sort_order: 1, subcategories: [] }],
    })

    const { result } = renderHook(() => useNavItems())

    expect(result.current[2].to).toBe('/laptops')
  })

  it('maps a non-laptops slug to /category/<slug>', () => {
    useCategories.mockReturnValue({
      navCategories: [{ name: 'Monitors', slug: 'monitors', sort_order: 1, subcategories: [] }],
    })

    const { result } = renderHook(() => useNavItems())

    expect(result.current[2].to).toBe('/category/monitors')
  })

  it('sets hasDropdown true only when subcategories exist and are non-empty', () => {
    useCategories.mockReturnValue({
      navCategories: [
        { name: 'With subs', slug: 'a', sort_order: 1, subcategories: [{ name: 'Sub' }] },
        { name: 'No subs', slug: 'b', sort_order: 2, subcategories: [] },
        { name: 'Undefined subs', slug: 'c', sort_order: 3 },
      ],
    })

    const { result } = renderHook(() => useNavItems())
    const [withSubs, noSubs, undefinedSubs] = result.current.slice(2)

    expect(withSubs.hasDropdown).toBe(true)
    expect(noSubs.hasDropdown).toBe(false)
    expect(undefinedSubs.hasDropdown).toBeFalsy()
  })
})
