import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBrandStore = create(
  persist(
    (set, get) => ({
      brands: [],

      addBrand: (brand) =>
        set((state) => ({
          brands: [
            ...state.brands,
            {
              ...brand,
              id: Date.now(),
              energy: brand.energy || 90,
              status: brand.status || 'completed',
            },
          ],
        })),

      updateBrand: (id, updatedBrand) =>
        set((state) => ({
          brands: state.brands.map((b) => (b.id === id ? { ...b, ...updatedBrand } : b)),
        })),

      deleteBrand: (id) =>
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
        })),

      syncProductBrands: (distinctProductBrands) => {
        if (!Array.isArray(distinctProductBrands) || distinctProductBrands.length === 0) return
        set((state) => {
          const existingTitles = new Set(state.brands.map((b) => (b.title || '').trim().toLowerCase()))
          const newBrands = []

          distinctProductBrands.forEach((title) => {
            if (!title || typeof title !== 'string') return
            const cleanTitle = title.trim()
            if (!cleanTitle) return
            const key = cleanTitle.toLowerCase()

            if (!existingTitles.has(key)) {
              existingTitles.add(key)
              newBrands.push({
                id: Date.now() + Math.floor(Math.random() * 10000),
                title: cleanTitle,
                date: `EST ${new Date().getFullYear()}`,
                content: `${cleanTitle} Official Products & Accessories.`,
                category: 'Product Brand',
                iconName: 'ShieldCheck',
                logoUrl: '', // Default empty to avoid non-existent CDN 404 network errors
                status: 'completed',
                energy: 95,
              })
            }
          })

          if (newBrands.length === 0) return state
          return { brands: [...state.brands, ...newBrands] }
        })
      },

      clearAllBrands: () => set({ brands: [] }),
    }),
    {
      name: 'cz_store_brands_v4',
    }
  )
)
