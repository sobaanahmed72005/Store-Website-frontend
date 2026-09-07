import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Sparkles, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import { useSeo } from '../hooks/useSeo'
import { useProductList } from '../hooks/useProductList'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'
import { ENDPOINTS } from '../api/endpoints'
import QuickViewModal from '../components/modals/QuickViewModal'

export default function SearchResults() {
  const { siteName } = useSiteSettings()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useSeo({
    title: query
      ? `Search Results for "${query}" | ${siteName || 'IT Solutions'}`
      : `Search Our Products | ${siteName || 'IT Solutions'}`,
    canonical: `${window.location.origin}${window.location.pathname}${window.location.search}`,
    noindex: true,
  })

  const {
    products: results,
    loading,
    page,
    setPage,
    totalPages,
    total,
    suggestedQuery,
    isCorrected,
  } = useProductList(query ? ENDPOINTS.PRODUCTS.SEARCH(query) : null)

  return (
    <div className="min-h-screen bg-cz-page flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-bold text-[#353535] tracking-tight">Search Results</h1>
          <SeoHeadingFiller h3="Matching products" h4="Result details" h5="No results guidance" h6="Related suggestions" />
          {!loading && (
            <p className="text-[14px] text-[#4b4b4b] mt-0.5">
              {total > 0
                ? `${total} result${total === 1 ? '' : 's'} for "${query}"`
                : `No results for "${query}"`}
            </p>
          )}
        </section>

        {/* Smart Typo Suggestion / Correction Banner */}
        {!loading && suggestedQuery && (
          <div className="w-full bg-cyan-50/90 border border-cyan-200/90 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100/90 flex items-center justify-center text-cyan-700 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-[13px] sm:text-[14px] text-slate-800">
                {isCorrected ? (
                  <>
                    No exact matches for <strong className="font-semibold text-slate-900">&quot;{query}&quot;</strong>.
                    Showing smart results for <strong className="font-bold text-cyan-900">&quot;{suggestedQuery}&quot;</strong>.
                  </>
                ) : (
                  <>
                    Did you mean <Link to={`/search?q=${encodeURIComponent(suggestedQuery)}`} className="font-bold text-cyan-800 underline hover:text-cyan-950">&quot;{suggestedQuery}&quot;</Link>?
                  </>
                )}
              </div>
            </div>

            {isCorrected && (
              <Link
                to={`/search?q=${encodeURIComponent(suggestedQuery)}`}
                className="text-[12px] font-bold text-cyan-800 hover:text-cyan-950 bg-white border border-cyan-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
              >
                Search for &quot;{suggestedQuery}&quot; instead
              </Link>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-[14px] text-[#4b4b4b] py-20 text-center font-medium">Searching catalog...</div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-[#dedede] rounded-[16px] shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="text-[16px] font-bold text-[#212121] mb-1">We couldn&apos;t find anything matching your search.</span>
            <span className="text-[13px] text-[#4b4b4b] mb-6 max-w-md leading-relaxed">
              Try checking your spelling or searching for a broader term like &quot;Power Bank&quot;, &quot;Laptop&quot;, or &quot;GPU&quot;.
            </span>
            <Link
              to="/shop"
              className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-bold px-8 py-3 transition-all shadow hover:shadow-md"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <ProductGrid products={results} onQuickView={setQuickViewProduct} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-10" />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>

      <Footer />

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  )
}
