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
import { ENDPOINTS } from '../api/endpoints'
import { categorySlugToPath } from '../utils/categoryPath'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

function ShopSidebar({ brands, selectedBrands, onToggleBrand }) {
  const { navCategories } = useCategories()
  return (
    <aside className="w-full lg:w-[260px] xl:w-[280px] lg:shrink-0">
      <div className="flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <FilterAccordion title="Categories" separator={false}>
          <div className="flex flex-col gap-2">
            {[...navCategories]
              .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
              .map((cat) => (
                <Link
                  key={cat.slug}
                  to={categorySlugToPath(cat.slug)}
                  className="group flex items-center gap-2 py-1 px-1.5 -mx-1.5 rounded-lg text-[14px] font-medium text-slate-700 hover:text-[#0c4a6e] hover:bg-slate-100/70 hover:translate-x-1 transition-all duration-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0c4a6e] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                  <span>{cat.name}</span>
                </Link>
              ))}
          </div>
        </FilterAccordion>
        {brands.length > 1 && (
          <FilterAccordion title="Brands">
            <CheckboxGroup
              options={brands}
              selectedValues={selectedBrands}
              onChange={onToggleBrand}
            />
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

const LIST_VIEW_CLASS = 'grid grid-cols-1 gap-6 pb-10'
const GRID_VIEW_CLASS = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10'

export default function Shop() {
  const { siteName } = useSiteSettings()
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('newest')
  const [availableBrands, setAvailableBrands] = useState([])
  const [view, setView] = useState('grid')

  useSeo({
    title: `Buy CCTV Cameras, Routers, Solar Panels & Laptops Online in Pakistan | ${siteName || 'IT Solutions'}`,
    description: `Explore the full ${siteName || 'IT Solutions'} catalog — 4K CCTV security cameras, enterprise networking Wi-Fi routers, solar systems, and laptops with nationwide cash on delivery in Pakistan.`,
    canonical: `${window.location.origin}/shop`,
    keywords: 'buy cctv camera pakistan, wifi 6 router pakistan, solar panel price pakistan, laptop hardware online store pakistan, it solutions lahore',
    publisher: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
  })

  useEffect(() => {
    api.get(ENDPOINTS.PRODUCTS.BRANDS).then(setAvailableBrands).catch(() => setAvailableBrands([]))
  }, [])

  const { products, total, page, totalPages, loading, error, setPage } = useProductList({
    brand: selectedBrands.size > 0 ? Array.from(selectedBrands) : undefined,
    sort: sortBy,
  })

  const toggleBrand = (brandId) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brandId)) next.delete(brandId)
      else next.add(brandId)
      return next
    })
  }

  const brands = availableBrands.map((b) => ({ id: b, label: b }))

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <Header />
      <CategoryMenu />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <section className="flex flex-col items-start mb-5">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">Shop</h1>
          <SeoHeadingFiller h4="Filter and sort options" h5="Product listing" h6="Pagination" />
          <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed font-normal mt-1">Products added by our store team, live from the catalog.</p>
        </section>

        {error && <div className="text-[14px] text-red-600 py-4 font-medium">{error}</div>}

        <div className="flex flex-col lg:flex-row gap-6">
          <ShopSidebar
            brands={brands}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200/80 shadow-sm px-4 py-3 mb-5">
              <span className="text-[14px] font-bold text-slate-800 font-heading">{total} Products</span>
              <div className="flex items-center gap-4">
                <ViewToggle view={view} onChange={setView} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort"
                  className="text-[14px] text-slate-700 bg-transparent outline-none cursor-pointer font-medium"
                >
                  {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <ProductGrid products={[]} loading={true} skeletonCount={12} className={view === 'grid' ? GRID_VIEW_CLASS : LIST_VIEW_CLASS} />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200/80 rounded-xl shadow-sm mb-10">
                {selectedBrands.size > 0 ? (
                  <>
                    <span className="text-[16px] font-bold text-slate-800 font-heading mb-2">No products match these filters.</span>
                    <span className="text-[14px] text-slate-500">Try clearing some filters to see more results.</span>
                  </>
                ) : (
                  <>
                    <span className="text-[16px] font-bold text-slate-800 font-heading mb-2">No products here yet.</span>
                    <span className="text-[14px] text-slate-500">Check back soon — new arrivals are added regularly.</span>
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
      </main>

      <Footer />
    </div>
  )
}
