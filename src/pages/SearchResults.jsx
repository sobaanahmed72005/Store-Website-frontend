import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { api, resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!query) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const data = await api.get(`/products?search=${encodeURIComponent(query)}`)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [query])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5 flex-1 w-full">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">Search Results</h1>
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>Search</span>
          </div>
          {!loading && (
            <p className="text-[14px] text-[#4b4b4b]">
              {results.length > 0
                ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
                : `No results for "${query}"`}
            </p>
          )}
        </section>

        {loading ? (
          <div className="text-[14px] text-[#4b4b4b] py-20 text-center">Searching...</div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px]">
            <span className="text-[16px] text-[#212121] mb-2">We couldn&apos;t find anything matching your search.</span>
            <span className="text-[14px] text-[#4b4b4b] mb-4">
              Try a different keyword, or check the spelling.
            </span>
            <Link
              to="/products"
              className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-10">
            {results.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                title={p.name}
                image={resolveImageUrl(p.image)}
                images={p.images?.map(resolveImageUrl)}
                stock={p.stock}
                rating={p.rating}
                {...getEffectivePrice(p)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
