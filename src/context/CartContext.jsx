import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const STORAGE_KEY = 'cz_cart'

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(readStoredCart)
  const [cartOpen, setCartOpen] = useState(false)
  const syncedForUser = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (!user || syncedForUser.current === user.id) return

    api
      .get(`/cart/${user.id}`, { auth: true })
      .then((serverItems) => {
        if (serverItems.length > 0) {
          setItems(
            serverItems.map((row) => ({
              id: String(row.product_ref),
              slug: row.product_slug,
              title: row.product_name,
              image: row.product_image,
              price: Number(row.price),
              qty: row.quantity,
            }))
          )
        }
        syncedForUser.current = user.id
      })
      .catch(() => {
        syncedForUser.current = user.id
      })
  }, [user])

  useEffect(() => {
    if (!user || syncedForUser.current !== user.id) return
    api.put(`/cart/${user.id}`, { items }, { auth: true }).catch(() => {})
  }, [items, user])

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id))
      if (existing) {
        return prev.map((item) => (String(item.id) === String(product.id) ? { ...item, qty: item.qty + qty } : item))
      }
      return [...prev, { ...product, qty }]
    })
    setCartOpen(true)
  }

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    )
  }

  const setQty = (id, qty) => {
    setItems((prev) => prev.map((item) => (String(item.id) === String(id) ? { ...item, qty: Math.max(1, qty) } : item)))
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)))
  }

  const clearCart = () => setItems([])

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subTotal,
        addToCart,
        updateQty,
        setQty,
        removeFromCart,
        clearCart,
        cartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
