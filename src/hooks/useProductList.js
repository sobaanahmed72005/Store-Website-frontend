import { useEffect, useRef, useState } from 'react'
import { api } from '../api/client'

// Shared by every product-listing page (Products, Shop, CategoryListing, SearchResults) — fetches
// one page of products from an endpoint returning { products, page, totalPages } (GET /products
// with whatever filter query string the caller needs), and resets back to page 1 whenever
// `queryPath` itself changes (a new category/search/filter) rather than only when the user clicks
// to a different page of the same query.
//
// Pass `null` for `queryPath` to skip fetching entirely (e.g. an empty search box) — the backend
// treats an empty `search=` param as "no filter" and would otherwise return the whole catalog.
export function useProductList(queryPath) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(!!queryPath)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const prevQueryPath = useRef(queryPath)

  useEffect(() => {
    const isNewQuery = prevQueryPath.current !== queryPath
    prevQueryPath.current = queryPath

    if (!queryPath) {
      setProducts([])
      setTotalPages(1)
      setTotal(0)
      setLoading(false)
      if (page !== 1) setPage(1)
      return
    }

    if (isNewQuery && page !== 1) {
      setPage(1)
      return // this effect reruns once `page` settles to 1, below
    }

    setLoading(true)
    setError('')
    const separator = queryPath.includes('?') ? '&' : '?'
    api
      .get(`${queryPath}${separator}page=${page}`)
      .then((data) => {
        setProducts(data.products)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      })
      .catch((err) => {
        setError(err.message)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [queryPath, page])

  return { products, loading, error, page, setPage, totalPages, total }
}
