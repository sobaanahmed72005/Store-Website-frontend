import { createContext, useContext, useEffect, useState } from 'react'
import { api, resolveImageUrl } from '../api/client'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

function mapItem(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    image: resolveImageUrl(p.image),
    price: Number(p.discount_price ?? p.price),
    stock: p.stock,
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    async function load() {
      if (!user) {
        setItems([])
        return
      }
      try {
        const rows = await api.get('/wishlist', { auth: true })
        setItems(rows.map(mapItem))
      } catch {
        setItems([])
      }
    }
    load()
  }, [user])

  const isWishlisted = (productId) => items.some((item) => item.id === productId)

  const toggleWishlist = async (product) => {
    if (!user) return false

    if (isWishlisted(product.id)) {
      setItems((prev) => prev.filter((item) => item.id !== product.id))
      api.del(`/wishlist/${product.id}`, { auth: true }).catch(() => {})
    } else {
      setItems((prev) => [mapItem(product), ...prev])
      api.post('/wishlist', { product_id: product.id }, { auth: true }).catch(() => {})
    }
    return true
  }

  const removeFromWishlist = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
    api.del(`/wishlist/${productId}`, { auth: true }).catch(() => {})
  }

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, isWishlisted, toggleWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
