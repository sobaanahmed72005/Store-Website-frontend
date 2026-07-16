import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import ViewToggle from '../components/ViewToggle'
import { FilterAccordion, CheckboxGroup, FilterCheckbox } from '../components/filters/FilterPrimitives'
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import { useProductList } from '../hooks/useProductList'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

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
          to="/shop"
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
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [selectedOptionIds, setSelectedOptionIds] = useState(() => new Set())
  const [view, setView] = useState('grid')

  useEffect(() => {
    setSelectedBrands(new Set())
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

  // Brand/attribute filters are applied server-side (both here and in the count/pagination
  // below) rather than client-side against whatever's already on the current page — a
  // client-side-only filter would silently only ever consider the 24 products on the current
  // page, showing a wrong count and, worse, leaving no way to reach a match that exists on a
  // different page once the current page's filtered results hit zero.
  const filterQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedBrands.size > 0) params.set('brand', [...selectedBrands].join(','))
    if (selectedOptionIds.size > 0) params.set('options', [...selectedOptionIds].join(','))
    const qs = params.toString()
    return qs ? `&${qs}` : ''
  }, [selectedBrands, selectedOptionIds])

  const { products, loading: loadingProducts, page, setPage, totalPages, total } = useProductList(
    `/products?category=${slug}${filterQuery}`
  )

  const attributes = dbCategory?.attributes || []

  const toggleOption = (optionId) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      if (next.has(optionId)) next.delete(optionId)
      else next.add(optionId)
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
    title: dbCategory ? `Buy ${dbCategory.name} Online in Pakistan — Best Prices | ${siteName || 'IT Network'}` : undefined,
    description: dbCategory?.description
      ? dbCategory.description.slice(0, 155)
      : dbCategory
        ? `Shop ${dbCategory.name} at ${siteName || 'IT Network'} — competitive prices and fast delivery.`
        : undefined,
    canonical: dbCategory ? canonical : undefined,
    keywords: dbCategory ? `${dbCategory.name.toLowerCase()}, laptops Pakistan, buy online, computer store Pakistan` : undefined,
    publisher: dbCategory ? siteName || 'IT Network' : undefined,
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
  const brands = (dbCategory.availableBrands || []).map((b) => ({ id: b, label: b }))
  const hasActiveFilters = selectedBrands.size > 0 || selectedOptionIds.size > 0

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
          <span>{dbCategory.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Content comes before the filter sidebar in source order so the page's h1 precedes
              the sidebar's filter-group h3s in document order — order-* below keeps the sidebar
              visually first, matching the layout before this reorder. */}
          <div className="order-2 flex-1 min-w-0">
            <h1 className="text-[20px] font-semibold text-[#212121]">{dbCategory.name}</h1>
            <SeoHeadingFiller h4="Filter and sort options" h5="Product listing" h6="Pagination" />
            {dbCategory.description && (
              <p className="mt-2 text-[14px] text-[#212121]">{dbCategory.description}</p>
            )}

            <div className="flex items-center justify-between bg-cz-gold-light rounded-[8px] px-4 py-3 mt-5 mb-4">
              <span className="text-[14px] text-[#212121]">{total} Products</span>
              <ViewToggle view={view} onChange={setView} />
            </div>

            {loadingProducts ? (
              <div className="text-[14px] text-[#4b4b4b] py-20 text-center">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-[#dedede] rounded-[10px]">
                {hasActiveFilters ? (
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
                <ProductGrid
                  products={products}
                  className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2' : 'grid grid-cols-1 gap-3'}
                />
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>

          <aside className="order-1 w-full lg:w-1/4 lg:shrink-0">
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
              {brands.length > 1 && (
                <FilterAccordion title="Brand" separator={subcategories.length > 0}>
                  <CheckboxGroup
                    items={brands}
                    selectedIds={selectedBrands}
                    onToggle={toggleBrand}
                  />
                </FilterAccordion>
              )}
              {attributes.map((attr) => (
                <FilterAccordion key={attr.id} title={attr.name}>
                  {attr.options.map((opt) => (
                    <FilterCheckbox
                      key={opt.id}
                      id={`attr-opt-${opt.id}`}
                      label={opt.value}
                      checked={selectedOptionIds.has(opt.id)}
                      onChange={() => toggleOption(opt.id)}
                    />
                  ))}
                </FilterAccordion>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
