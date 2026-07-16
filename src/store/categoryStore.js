import { create } from 'zustand'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

export const useCategoryStore = create((set) => ({
  tree: [],
  loading: true,

  init: () => {
    api
      .get(ENDPOINTS.CATEGORIES.TREE)
      .then((tree) => set({ tree }))
      .catch(() => set({ tree: [] }))
      .finally(() => set({ loading: false }))
  },
}))

export function useCategories() {
  const { tree, loading } = useCategoryStore()
  const navCategories = tree.filter((c) => c.show_in_nav)
  const iconCategories = tree.filter((c) => c.show_in_icons)
  return { tree, navCategories, iconCategories, loading }
}
