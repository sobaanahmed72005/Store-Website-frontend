import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import { GridIcon, ListIcon } from '../components/icons'
import { FilterAccordion, CheckboxGroup } from '../components/filters/FilterPrimitives'
import { useCategories } from '../context/CategoryContext'
import { getEffectivePrice } from '../utils/pricing'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useProductList } from '../hooks/useProductList'

function categoryPath(slug) {
  return slug === 'laptops' ? '/laptops' : `/category/${slug}`
}

function ProductsSidebar({ brands, selectedBrands, onToggleBrand }) {
  const { navCategories } = useCategories()
  return (
    <aside className="w-full lg:w-1/4 lg:shrink-0">
      <div className="flex flex-col bg-cz-gold-light p-5">
        <FilterAccordion title="Categories" separator={false}>
          {[...navCategories]
            .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
            .map((cat) => (
              <Link
                key={cat.slug}
                to={categoryPath(cat.slug)}
                className="text-[14px] font-normal text-[#212121] cursor-pointer hover:underline"
              >
                {cat.name}
              </Link>
            ))}
        </FilterAccordion>

        {brands.length > 0 && (
          <FilterAccordion title="Brand">
            <CheckboxGroup items={brands} selectedIds={selectedBrands} onToggle={onToggleBrand} />
          </FilterAccordion>
        )}
      </div>
    </aside>
  )
}

const FILTER_CONFIG = {
  featured:    { param: 'featured=1',    label: 'Featured Products' },
  on_sale:     { param: 'on_sale=1',     label: 'On Sale' },
  new_arrival: { param: 'new_arrival=1', label: 'New Arrivals' },
}

const SORT_OPTIONS = {
  price_asc:  { label: 'Price Low - High', compare: (a, b) => getEffectivePrice(a).price - getEffectivePrice(b).price },
  price_desc: { label: 'Price High - Low', compare: (a, b) => getEffectivePrice(b).price - getEffectivePrice(a).price },
  rating:     { label: 'Highest Rated', compare: (a, b) => (b.rating || 0) - (a.rating || 0) },
  name_asc:   { label: 'A - Z', compare: (a, b) => a.name.localeCompare(b.name) },
  name_desc:  { label: 'Z - A', compare: (a, b) => b.name.localeCompare(a.name) },
  newest:     { label: 'Recently Added', compare: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
}

export default function Products() {
  const { siteName } = useSiteSettings()
  const [searchParams] = useSearchParams()
  const activeFilter = Object.keys(FILTER_CONFIG).find((k) => searchParams.get(k) === '1') || null
  const pageTitle = activeFilter ? FILTER_CONFIG[activeFilter].label : 'All Products'

  // /shop is the canonical all-products listing (richer filtering UI) — this page's
  // content is a subset/near-duplicate of it, so every variant here points there
  // to consolidate ranking signals instead of splitting them across near-identical pages.
  useSeo({
    title: `${pageTitle} | ${siteName || 'IT Network'}`,
    description: `${pageTitle} at ${siteName || 'IT Network'} — competitive prices and fast delivery.`,
    canonical: `${window.location.origin}/shop`,
  })

  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('newest')

  const queryPath = activeFilter ? `/products?${FILTER_CONFIG[activeFilter].param}` : '/products'
  // Server-paginated (24/page) so the catalog can't grow into an unbounded fetch. Brand
  // filter/sort below only apply within the current page — see Shop.jsx for the same tradeoff.
  const { products, loading, page, setPage, totalPages, total } = useProductList(queryPath)

  useEffect(() => {
    setSelectedBrands(new Set())
  }, [activeFilter])

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) next.delete(brand)
      else next.add(brand)
      return next
    })
  }

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].map((b) => ({ id: b, label: b }))

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false
      return true
    })
    return [...filtered].sort(SORT_OPTIONS[sortBy].compare)
  }, [products, selectedBrands, sortBy])

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full mx-auto px-5 py-5">
        <div className="flex items-center gap-2 mb-4 text-[13px]">
          <span className="opacity-70 hover:underline after:content-['/'] after:ml-2 after:opacity-70">
            <Link to="/">Home</Link>
          </span>
          <span>{pageTitle}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <ProductsSidebar
            brands={brands}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-semibold text-[#212121]">{pageTitle}</h1>

            <div className="flex items-center justify-between bg-cz-gold-light rounded-[8px] px-4 py-3 mt-5 mb-4">
              {/* total is the true server-side count for this filter; falls back to the
                  page-scoped filteredProducts count once a client-side brand filter narrows
                  further, since that narrowing only applies within the current page. */}
              <span className="text-[14px] text-[#212121]">
                {selectedBrands.size > 0 ? filteredProducts.length : total} Products
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="Change View" className="text-[#212121]">
                    <GridIcon size={16} />
                  </button>
                  <button type="button" aria-label="Change View" className="text-[#212121] opacity-70">
                    <ListIcon size={16} />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort"
                  className="text-[14px] text-[#212121] bg-transparent outline-none cursor-pointer"
                >
                  {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-[14px] text-[#4b4b4b] py-20 text-center">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px]">
                <span className="text-[16px] text-[#212121] mb-2">No products here yet.</span>
                <span className="text-[14px] text-[#4b4b4b]">Check back soon — new arrivals are added regularly.</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px]">
                <span className="text-[16px] text-[#212121] mb-2">No products match these filters.</span>
                <span className="text-[14px] text-[#4b4b4b]">Try clearing some filters to see more results.</span>
              </div>
            ) : (
              <>
                <ProductGrid products={filteredProducts} />
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
