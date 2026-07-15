import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

function ShopSidebar({ brands, selectedBrands, onToggleBrand }) {
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

const SORT_OPTIONS = {
  newest:     { label: 'Recently Added' },
  price_asc:  { label: 'Price Low - High' },
  price_desc: { label: 'Price High - Low' },
  rating:     { label: 'Highest Rated' },
  name_asc:   { label: 'A - Z' },
  name_desc:  { label: 'Z - A' },
}

const LIST_VIEW_CLASS = 'grid grid-cols-1 gap-3 pb-10'
const GRID_VIEW_CLASS = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-10'

export default function Shop() {
  const { siteName } = useSiteSettings()
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('newest')
  const [availableBrands, setAvailableBrands] = useState([])
  const [view, setView] = useState('grid')

  useSeo({
    title: `Shop All Products | ${siteName || 'IT Network'}`,
    description: `Browse the full ${siteName || 'IT Network'} catalog — laptops, gaming gear, and PC components, with filters by brand.`,
    canonical: `${window.location.origin}/shop`,
  })

  // Independent of whatever brand filter/page is currently active, so the sidebar's checkbox
  // list stays stable instead of shrinking to just whatever's on the current filtered page.
  useEffect(() => {
    api.get('/products/brands').then(setAvailableBrands).catch(() => setAvailableBrands([]))
  }, [])

  // Server-paginated (24/page), server-filtered by brand, and now server-sorted too — sorting
  // client-side used to only reorder the current page's 24 products instead of the whole
  // catalog, so "Price Low - High" could easily miss the true cheapest product sitting on a
  // different page.
  const params = new URLSearchParams()
  if (selectedBrands.size > 0) params.set('brand', [...selectedBrands].join(','))
  params.set('sort', sortBy)
  const { products, loading, error, page, setPage, totalPages, total } = useProductList(`/products?${params.toString()}`)

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

      <div className="mx-auto px-5 py-5 flex-1 w-full">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">Shop</h1>
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>Shop</span>
          </div>
          <p className="text-[14px] text-[#4b4b4b]">Products added by our store team, live from the catalog.</p>
        </section>

        {error && <div className="text-[14px] text-red-600 py-4">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-5">
          <ShopSidebar
            brands={brands}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between bg-cz-gold-light rounded-[8px] px-4 py-3 mb-4">
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
              <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px] mb-10">
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
