import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const CategoryContext = createContext(null)

export function CategoryProvider({ children }) {
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/categories/tree')
      .then(setTree)
      .catch(() => setTree([]))
      .finally(() => setLoading(false))
  }, [])

  const navCategories = tree.filter((c) => c.show_in_nav)
  const iconCategories = tree.filter((c) => c.show_in_icons)

  return (
    <CategoryContext.Provider value={{ tree, navCategories, iconCategories, loading }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoryContext)
  if (!ctx) throw new Error('useCategories must be used within a CategoryProvider')
  return ctx
}
