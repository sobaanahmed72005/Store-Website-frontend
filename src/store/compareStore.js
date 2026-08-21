import { create } from 'zustand'

export const useCompareStore = create((set, get) => ({
  items: [],
  isModalOpen: false,

  addToCompare: (product) => {
    const current = get().items
    if (current.some((i) => i.id === product.id || i.slug === product.slug)) {
      return
    }
    if (current.length >= 4) {
      alert('You can compare up to 4 products at a time.')
      return
    }
    set({ items: [...current, product] })
  },

  removeFromCompare: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId && i.slug !== productId) })
  },

  clearCompare: () => {
    set({ items: [], isModalOpen: false })
  },

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}))
