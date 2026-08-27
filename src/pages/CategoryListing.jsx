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
import { ENDPOINTS } from '../api/endpoints'
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight mb-2">{label}</h1>
        <p className="text-[14px] sm:text-[15px] text-slate-600 mb-6 max-w-[420px]">
          We&apos;re still stocking up this category. In the meantime, take a look at everything
          else we have available.
        </p>
        <Link
          to="/shop"
          className="rounded-xl bg-[#0c4a6e] hover:bg-[#083b58] text-white text-[14px] font-semibold px-8 py-3 shadow transition-all"
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
        const cat = await api.get(ENDPOINTS.CATEGORIES.BY_SLUG(slug))
        setDbCategory(cat)
      } catch {
        setDbCategory(null)
      } finally {
        setDbChecked(true)
      }
    }
    load()
  }, [slug])

  const attributes = useMemo(() => dbCategory?.attributes || [], [dbCategory])

  // An option's displayed value can be backed by more than one underlying
  // category_attribute_options row — the merged-attributes endpoint groups same-value options
  // across this category and its descendants into one checkbox with all of their ids, so
  // selecting it must filter on every id in that group, not just one. Keyed by attribute id +
  // value (not a single id, which no longer exists on the option) so the same value under two
  // different attributes doesn't collide.
  const optionIdsByKey = useMemo(() => {
    const map = new Map()
    for (const attr of attributes) {
      for (const opt of attr.options) {
        map.set(`${attr.id}:${opt.value}`, opt.ids)
      }
    }
    return map
  }, [attributes])

  // Brand/attribute filters are applied server-side (both here and in the count/pagination
  // below) rather than client-side against whatever's already on the current page — a
  // client-side-only filter would silently only ever consider the 24 products on the current
  // page, showing a wrong count and, worse, leaving no way to reach a match that exists on a
  // different page once the current page's filtered results hit zero.
  const filterQuery = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedBrands.size > 0) params.set('brand', [...selectedBrands].join(','))
    if (selectedOptionIds.size > 0) {
      const ids = [...selectedOptionIds].flatMap((key) => optionIdsByKey.get(key) || [])
      if (ids.length > 0) params.set('options', ids.join(','))
    }
    const qs = params.toString()
    return qs ? `&${qs}` : ''
  }, [selectedBrands, selectedOptionIds, optionIdsByKey])

  const { products, loading: loadingProducts, page, setPage, totalPages, total } = useProductList(
    ENDPOINTS.PRODUCTS.LIST(`?category=${slug}${filterQuery}`)
  )

  const toggleOption = (key) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
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
    title: dbCategory ? `Buy ${dbCategory.name} Online in Pakistan — Best Prices | ${siteName || 'IT Solutions'}` : undefined,
    description: dbCategory?.description
      ? dbCategory.description.slice(0, 155)
      : dbCategory
        ? `Shop ${dbCategory.name} at ${siteName || 'IT Solutions'} — competitive prices and fast delivery.`
        : undefined,
    canonical: dbCategory ? canonical : undefined,
    keywords: dbCategory ? `${dbCategory.name.toLowerCase()}, laptops Pakistan, buy online, computer store Pakistan` : undefined,
    publisher: dbCategory ? siteName || 'IT Solutions' : undefined,
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Content section */}
          <div className="order-2 flex-1 min-w-0">
            <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
              {dbCategory.name}
            </h1>
            <SeoHeadingFiller h4="Filter and sort options" h5="Product listing" h6="Pagination" />
            {dbCategory.description && (
              <p className="mt-2 text-[14px] sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                {dbCategory.description}
              </p>
            )}

            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200/80 shadow-sm px-4 py-3 mt-5 mb-5">
              <span className="text-[14px] font-bold text-slate-800 font-heading">{total} Products</span>
              <ViewToggle view={view} onChange={setView} />
            </div>

            {loadingProducts ? (
              <ProductGrid
                products={[]}
                loading={true}
                skeletonCount={8}
                className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'grid grid-cols-1 gap-6'}
              />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200/80 rounded-xl shadow-sm">
                {hasActiveFilters ? (
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
                <ProductGrid
                  products={products}
                  className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'grid grid-cols-1 gap-6'}
                />
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </div>

          {/* Filter Sidebar */}
          <aside className="order-1 w-full lg:w-[260px] xl:w-[280px] lg:shrink-0">
            <div className="flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
              {subcategories.length > 0 && (
                <FilterAccordion title="Categories" separator={false}>
                  <div className="flex flex-col gap-2">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        to={`/category/${sub.slug}`}
                        className="group flex items-center gap-2 py-1 px-1.5 -mx-1.5 rounded-lg text-[14px] font-medium text-slate-700 hover:text-[#0c4a6e] hover:bg-slate-100/70 hover:translate-x-1 transition-all duration-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0c4a6e] opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                        <span>{sub.name}</span>
                      </Link>
                    ))}
                  </div>
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
                  {attr.options.map((opt) => {
                    const key = `${attr.id}:${opt.value}`
                    return (
                      <FilterCheckbox
                        key={key}
                        id={`attr-opt-${key}`}
                        label={opt.value}
                        checked={selectedOptionIds.has(key)}
                        onChange={() => toggleOption(key)}
                      />
                    )
                  })}
                </FilterAccordion>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
