import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { GridIcon, ListIcon } from '../components/icons'
import { FilterAccordion, CheckboxGroup, PriceRangeFilter } from '../components/filters/FilterPrimitives'
import { api, resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'

function CategoryNotFound({ slug }) {
  const label = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="text-[20px] font-semibold text-[#212121] mb-2">{label}</h1>
        <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
          We&apos;re still stocking up this category. In the meantime, take a look at everything
          else we have available.
        </p>
        <Link
          to="/products"
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
        >
          Browse All Products
        </Link>
      </div>
      <Footer />
    </div>
  )
}

export default function CategoryListing() {
  const { slug } = useParams()
  const { siteName } = useSiteSettings()
  const [dbCategory, setDbCategory] = useState(null)
  const [dbChecked, setDbChecked] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [priceRange, setPriceRange] = useState(null)
  const [selectedOptionIds, setSelectedOptionIds] = useState(() => new Set())

  useEffect(() => {
    setSelectedBrands(new Set())
    setPriceRange(null)
    setSelectedOptionIds(new Set())
  }, [slug])

  useEffect(() => {
    async function load() {
      setDbChecked(false)
      try {
        const cat = await api.get(`/categories/${slug}`)
        setDbCategory(cat)
      } catch {
        setDbCategory(null)
      } finally {
        setDbChecked(true)
      }
    }
    load()
  }, [slug])

  useEffect(() => {
    async function load() {
      setLoadingProducts(true)
      try {
        const data = await api.get(`/products?category=${slug}`)
        setProducts(data)
      } catch {
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }
    load()
  }, [slug])

  const attributes = dbCategory?.attributes || []

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false
      if (priceRange) {
        const { price } = getEffectivePrice(p)
        if (price < priceRange[0] || price > priceRange[1]) return false
      }
      for (const attr of attributes) {
        const selectedForAttr = attr.options.filter((o) => selectedOptionIds.has(o.id)).map((o) => o.id)
        if (selectedForAttr.length === 0) continue
        const productOptionIds = p.attribute_option_ids || []
        if (!selectedForAttr.some((id) => productOptionIds.includes(id))) return false
      }
      return true
    })
  }, [products, selectedBrands, priceRange, selectedOptionIds, attributes])

  const toggleOption = (id) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) next.delete(brand)
      else next.add(brand)
      return next
    })
  }

  const origin = window.location.origin
  const canonical = `${origin}/category/${slug}`
  useSeo({
    title: dbCategory ? `${dbCategory.name} | ${siteName || 'IT Network'}` : undefined,
    description: dbCategory?.description
      ? dbCategory.description.slice(0, 155)
      : dbCategory
        ? `Shop ${dbCategory.name} at ${siteName || 'IT Network'} — competitive prices and fast delivery.`
        : undefined,
    canonical: dbCategory ? canonical : undefined,
    noindex: !dbCategory,
    jsonLd: dbCategory
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: dbCategory.name, item: canonical },
          ],
        }
      : undefined,
  })

  if (!dbChecked) return null
  if (!dbCategory) return <CategoryNotFound slug={slug} />

  const subcategories = dbCategory.subcategories || []
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].map((b) => ({ id: b, label: b }))

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
        <div className="flex items-center gap-2 mb-4 text-[13px]">
          <span className="opacity-70 hover:underline after:content-['/'] after:ml-2 after:opacity-70">
            <Link to="/">Home</Link>
          </span>
          <span>{dbCategory.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <aside className="w-full lg:w-1/4 lg:shrink-0">
            <div className="flex flex-col bg-cz-gold-light p-5">
              {subcategories.length > 0 && (
                <FilterAccordion title="Categories" separator={false}>
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      to={`/category/${sub.slug}`}
                      className="text-[14px] font-normal text-[#212121] cursor-pointer hover:underline hover:text-cz-primary"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </FilterAccordion>
              )}
              <FilterAccordion title="Price Range" separator={subcategories.length > 0}>
                <PriceRangeFilter min={0} max={1499999} onApply={(from, to) => setPriceRange([from, to])} />
              </FilterAccordion>
              {brands.length > 1 && (
                <FilterAccordion title="Brand">
                  <CheckboxGroup
                    items={brands}
                    selectedIds={selectedBrands}
                    onToggle={toggleBrand}
                  />
                </FilterAccordion>
              )}
              {attributes.map((attr) => (
                <FilterAccordion key={attr.id} title={attr.name}>
                  <CheckboxGroup
                    items={attr.options.map((o) => ({ id: o.id, label: o.value }))}
                    selectedIds={selectedOptionIds}
                    onToggle={toggleOption}
                  />
                </FilterAccordion>
              ))}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-semibold text-[#212121]">{dbCategory.name}</h1>
            {dbCategory.description && (
              <p className="mt-2 text-[14px] text-[#212121]">{dbCategory.description}</p>
            )}

            <div className="flex items-center justify-between bg-cz-gold-light rounded-[8px] px-4 py-3 mt-5 mb-4">
              <span className="text-[14px] text-[#212121]">{filteredProducts.length} Products</span>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Change View" className="text-[#212121]">
                  <GridIcon size={16} />
                </button>
                <button type="button" aria-label="Change View" className="text-[#212121] opacity-70">
                  <ListIcon size={16} />
                </button>
              </div>
            </div>

            {loadingProducts ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
