import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import ViewToggle from '../components/ViewToggle'
import { FilterAccordion, CheckboxGroup } from '../components/filters/FilterPrimitives'
import { useCategories } from '../store/categoryStore'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import { useProductList } from '../hooks/useProductList'
import { api } from '../api/client'
import { categorySlugToPath } from '../utils/categoryPath'

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
                to={categorySlugToPath(cat.slug)}
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
  featured:    { label: 'Featured Products' },
  on_sale:     { label: 'On Sale' },
  new_arrival: { label: 'New Arrivals' },
}

const SORT_OPTIONS = {
  price_asc:  { label: 'Price Low - High' },
  price_desc: { label: 'Price High - Low' },
  rating:     { label: 'Highest Rated' },
  name_asc:   { label: 'A - Z' },
  name_desc:  { label: 'Z - A' },
  newest:     { label: 'Recently Added' },
}

const LIST_VIEW_CLASS = 'grid grid-cols-1 gap-3'
const GRID_VIEW_CLASS = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'

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
  const [availableBrands, setAvailableBrands] = useState([])
  const [view, setView] = useState('grid')

  // Independent of whatever brand filter/page is currently active, so the sidebar's checkbox
  // list stays stable instead of shrinking to just whatever's on the current filtered page.
  useEffect(() => {
    api.get('/products/brands').then(setAvailableBrands).catch(() => setAvailableBrands([]))
  }, [])

  // Server-paginated (24/page), server-filtered by brand, and now server-sorted too — see
  // Shop.jsx for why that matters (client-side-only filtering/sorting gave a wrong product
  // count, could strand you on a page with zero visible results even when matches existed
  // elsewhere, and "Price Low - High" could miss the true cheapest product on another page).
  const params = new URLSearchParams()
  if (activeFilter) params.set(activeFilter, '1')
  if (selectedBrands.size > 0) params.set('brand', [...selectedBrands].join(','))
  params.set('sort', sortBy)
  const { products, loading, page, setPage, totalPages, total } = useProductList(`/products?${params.toString()}`)

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

  const brands = availableBrands.map((b) => ({ id: b, label: b }))

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
              <span className="text-[14px] text-[#212121]">{total} Products</span>
              <div className="flex items-center gap-4">
                <ViewToggle view={view} onChange={setView} />
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
                {selectedBrands.size > 0 ? (
                  <>
                    <span className="text-[16px] text-[#212121] mb-2">No products match these filters.</span>
                    <span className="text-[14px] text-[#4b4b4b]">Try clearing some filters to see more results.</span>
                  </>
                ) : (
                  <>
                    <span className="text-[16px] text-[#212121] mb-2">No products here yet.</span>
                    <span className="text-[14px] text-[#4b4b4b]">Check back soon — new arrivals are added regularly.</span>
                  </>
                )}
              </div>
            ) : (
              <>
                <ProductGrid products={products} className={view === 'grid' ? GRID_VIEW_CLASS : LIST_VIEW_CLASS} />
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
