import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Smartphone, BatteryCharging, Cpu, Video, ShieldCheck, Radio, Laptop, Monitor, HardDrive } from 'lucide-react'

const INITIAL_BRANDS = [
  {
    id: 1,
    title: 'Apple',
    date: 'EST 1976',
    content: 'Flagship Computing & Mobile Ecosystem. Premium MacBook, iPad, iPhone, and official accessories.',
    category: 'Computers & Mobile',
    iconName: 'Smartphone',
    logoUrl: 'https://cdn.simpleicons.org/apple/000000',
    relatedIds: [2, 3],
    status: 'completed',
    energy: 98,
  },
  {
    id: 2,
    title: 'Romoss',
    date: 'EST 2012',
    content: 'High-Capacity Power Banks, Rapid Charging Stations, and Mobile Power Solutions.',
    category: 'Power & Charging',
    iconName: 'BatteryCharging',
    relatedIds: [1, 4],
    status: 'completed',
    energy: 95,
  },
  {
    id: 3,
    title: 'Vivo',
    date: 'EST 2009',
    content: 'Next-Gen Mobile Technology, AMOLED Displays, and Pro Photo Camera Smartphones.',
    category: 'Smart Mobility',
    iconName: 'Cpu',
    logoUrl: 'https://cdn.simpleicons.org/vivo/0051C5',
    relatedIds: [1, 5],
    status: 'in-progress',
    energy: 92,
  },
  {
    id: 4,
    title: 'EZVIZ',
    date: 'EST 2013',
    content: 'AI-Powered Smart Security Cameras, Wireless Outdoor Vision, and Smart Home Automation.',
    category: 'Smart Security',
    iconName: 'Video',
    relatedIds: [2, 5],
    status: 'completed',
    energy: 90,
  },
  {
    id: 5,
    title: 'Hikvision',
    date: 'EST 2001',
    content: 'World-Leading Security Surveillance, Ultra HD NVR Systems, and Enterprise Optical Tech.',
    category: 'Surveillance',
    iconName: 'ShieldCheck',
    relatedIds: [3, 4, 6],
    status: 'completed',
    energy: 96,
  },
  {
    id: 6,
    title: 'IMOU',
    date: 'EST 2015',
    content: 'Consumer IoT & Smart Cloud Cameras, Wi-Fi 6 Routers, and Smart Lock Security.',
    category: 'Smart Home',
    iconName: 'Radio',
    relatedIds: [4, 5],
    status: 'in-progress',
    energy: 88,
  },
  {
    id: 7,
    title: 'Dell',
    date: 'EST 1984',
    content: 'High-Performance XPS Laptops, Alienware Gaming Systems, and UltraSharp Enterprise Displays.',
    category: 'Computers & Gaming',
    iconName: 'Laptop',
    logoUrl: 'https://cdn.simpleicons.org/dell/0076D0',
    relatedIds: [1, 8],
    status: 'completed',
    energy: 97,
  },
  {
    id: 8,
    title: 'HP',
    date: 'EST 1939',
    content: 'ProBook Business Laptops, Pavilion Everyday Computing, and OMEN Gaming Desktop Systems.',
    category: 'Computers & Printing',
    iconName: 'Laptop',
    logoUrl: 'https://cdn.simpleicons.org/hp/0096D6',
    relatedIds: [7, 9],
    status: 'completed',
    energy: 94,
  },
  {
    id: 9,
    title: 'Lenovo',
    date: 'EST 1984',
    content: 'ThinkPad Enterprise Laptops, Yoga Convertible Notebooks, and Legion High-FPS Gaming PCs.',
    category: 'Laptops & Workstations',
    iconName: 'Cpu',
    logoUrl: 'https://cdn.simpleicons.org/lenovo/E2231A',
    relatedIds: [8, 10],
    status: 'completed',
    energy: 96,
  },
  {
    id: 10,
    title: 'Asus',
    date: 'EST 1989',
    content: 'Republic of Gamers (ROG) Flagship Laptops, Gaming Motherboards, and High-Hz Monitors.',
    category: 'Gaming Hardware',
    iconName: 'Monitor',
    logoUrl: 'https://cdn.simpleicons.org/asus/00539B',
    relatedIds: [9, 11],
    status: 'completed',
    energy: 99,
  },
  {
    id: 11,
    title: 'Samsung',
    date: 'EST 1938',
    content: 'Ultra-Fast NVMe SSD Storage, Odyssey Gaming Monitors, and Pro Memory Components.',
    category: 'Storage & Monitors',
    iconName: 'HardDrive',
    logoUrl: 'https://cdn.simpleicons.org/samsung/142890',
    relatedIds: [10, 1],
    status: 'completed',
    energy: 98,
  },
]

export const useBrandStore = create(
  persist(
    (set, get) => ({
      brands: INITIAL_BRANDS,

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
              const simpleIconSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '')
              const autoLogoUrl = `https://cdn.simpleicons.org/${simpleIconSlug}`

              newBrands.push({
                id: Date.now() + Math.floor(Math.random() * 10000),
                title: cleanTitle,
                date: `EST ${new Date().getFullYear()}`,
                content: `${cleanTitle} Official Products & Accessories.`,
                category: 'Product Brand',
                iconName: 'ShieldCheck',
                logoUrl: autoLogoUrl,
                status: 'completed',
                energy: 95,
              })
            }
          })

          if (newBrands.length === 0) return state
          return { brands: [...state.brands, ...newBrands] }
        })
      },

      resetToDefault: () => set({ brands: INITIAL_BRANDS }),
    }),
    {
      name: 'cz_store_brands_orbit',
    }
  )
)
