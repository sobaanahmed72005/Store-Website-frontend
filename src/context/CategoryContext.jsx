import { createContext, useContext, useEffect, useMemo, useState } from 'react'
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

  const navCategories = useMemo(() => tree.filter((c) => c.show_in_nav), [tree])
  const iconCategories = useMemo(() => tree.filter((c) => c.show_in_icons), [tree])

  // Memoized so consumers relying on reference equality don't re-render on every unrelated
  // change elsewhere in the app — this provider wraps the whole tree.
  const value = useMemo(
    () => ({ tree, navCategories, iconCategories, loading }),
    [tree, navCategories, iconCategories, loading]
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategories() {
  const ctx = useContext(CategoryContext)
  if (!ctx) throw new Error('useCategories must be used within a CategoryProvider')
  return ctx
}
