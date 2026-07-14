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
  const [wishlistOpen, setWishlistOpen] = useState(false)

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

  // These update local state optimistically before the request resolves, so a failure has to be
  // rolled back explicitly — otherwise the UI keeps showing an add/remove that never actually
  // happened server-side (silently reverting itself on the next real fetch, with no indication
  // to the customer of why).
  const toggleWishlist = async (product) => {
    if (!user) return false

    if (isWishlisted(product.id)) {
      setItems((prev) => prev.filter((item) => item.id !== product.id))
      api.del(`/wishlist/${product.id}`, { auth: true }).catch((err) => {
        console.error('Failed to remove from wishlist:', err)
        setItems((prev) => (prev.some((item) => item.id === product.id) ? prev : [mapItem(product), ...prev]))
      })
    } else {
      setItems((prev) => [mapItem(product), ...prev])
      api.post('/wishlist', { product_id: product.id }, { auth: true }).catch((err) => {
        console.error('Failed to add to wishlist:', err)
        setItems((prev) => prev.filter((item) => item.id !== product.id))
      })
      setWishlistOpen(true)
    }
    return true
  }

  const removeFromWishlist = (productId) => {
    const removed = items.find((item) => item.id === productId)
    setItems((prev) => prev.filter((item) => item.id !== productId))
    api.del(`/wishlist/${productId}`, { auth: true }).catch((err) => {
      console.error('Failed to remove from wishlist:', err)
      if (removed) setItems((prev) => (prev.some((item) => item.id === productId) ? prev : [removed, ...prev]))
    })
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        wishlistOpen,
        openWishlist: () => setWishlistOpen(true),
        closeWishlist: () => setWishlistOpen(false),
      }}
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
