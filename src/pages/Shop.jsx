import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { GridIcon, ListIcon } from '../components/icons'
import { FilterAccordion, CheckboxGroup, PriceRangeFilter } from '../components/filters/FilterPrimitives'
import { useCategories } from '../context/CategoryContext'
import { api, resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'

function categoryPath(slug) {
  return slug === 'laptops' ? '/laptops' : `/category/${slug}`
}

function ShopSidebar({ brands, selectedBrands, onToggleBrand, onApplyPriceRange }) {
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

        <FilterAccordion title="Price Range">
          <PriceRangeFilter min={0} max={1499999} onApply={onApplyPriceRange} />
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
  newest:     { label: 'Recently Added', compare: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
  price_asc:  { label: 'Price Low - High', compare: (a, b) => getEffectivePrice(a).price - getEffectivePrice(b).price },
  price_desc: { label: 'Price High - Low', compare: (a, b) => getEffectivePrice(b).price - getEffectivePrice(a).price },
  rating:     { label: 'Highest Rated', compare: (a, b) => (b.rating || 0) - (a.rating || 0) },
  name_asc:   { label: 'A - Z', compare: (a, b) => a.name.localeCompare(b.name) },
  name_desc:  { label: 'Z - A', compare: (a, b) => b.name.localeCompare(a.name) },
}

export default function Shop() {
  const { siteName } = useSiteSettings()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [priceRange, setPriceRange] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  useSeo({
    title: `Shop All Products | ${siteName || 'IT Network'}`,
    description: `Browse the full ${siteName || 'IT Network'} catalog — laptops, gaming gear, and PC components, with filters by brand and price.`,
    canonical: `${window.location.origin}/shop`,
  })

  useEffect(() => {
    api
      .get('/products')
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
      if (priceRange) {
        const { price } = getEffectivePrice(p)
        if (price < priceRange[0] || price > priceRange[1]) return false
      }
      return true
    })
    return [...filtered].sort(SORT_OPTIONS[sortBy].compare)
  }, [products, selectedBrands, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5 flex-1 w-full">
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
            onApplyPriceRange={(from, to) => setPriceRange([from, to])}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between bg-cz-gold-light rounded-[8px] px-4 py-3 mb-4">
              <span className="text-[14px] text-[#212121]">{filteredProducts.length} Products</span>
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
              <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px] mb-10">
                <span className="text-[16px] text-[#212121] mb-2">No products here yet.</span>
                <span className="text-[14px] text-[#4b4b4b]">Check back soon — new arrivals are added regularly.</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px] mb-10">
                <span className="text-[16px] text-[#212121] mb-2">No products match these filters.</span>
                <span className="text-[14px] text-[#4b4b4b]">Try clearing some filters to see more results.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pb-10">
                {filteredProducts.map((p) => (
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
        </div>
      </div>

      <Footer />
    </div>
  )
}
