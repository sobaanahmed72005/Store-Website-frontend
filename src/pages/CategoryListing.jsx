import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import { GridIcon, ListIcon } from '../components/icons'
import { FilterAccordion, CheckboxGroup, FilterCheckbox } from '../components/filters/FilterPrimitives'
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useProductList } from '../hooks/useProductList'

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
  const [selectedBrands, setSelectedBrands] = useState(() => new Set())
  const [selectedOptionIds, setSelectedOptionIds] = useState(() => new Set())

  // Server-paginated (24/page) so the catalog can't grow into an unbounded fetch. Brand/attribute
  // filters below only apply within the current page — see Shop.jsx for the same tradeoff.
  const { products, loading: loadingProducts, page, setPage, totalPages, total } = useProductList(`/products?category=${slug}`)

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

  const attributes = dbCategory?.attributes || []

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false
      for (const attr of attributes) {
        // A merged option can represent several underlying option rows (e.g. the same "16GB"
        // value defined on two different subcategories) — match the product against any of them.
        const selectedIds = attr.options.filter((o) => o.ids.some((id) => selectedOptionIds.has(id))).flatMap((o) => o.ids)
        if (selectedIds.length === 0) continue
        const productOptionIds = p.attribute_option_ids || []
        if (!selectedIds.some((id) => productOptionIds.includes(id))) return false
      }
      return true
    })
  }, [products, selectedBrands, selectedOptionIds, attributes])

  const toggleOption = (optionIds) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      const anySelected = optionIds.some((id) => next.has(id))
      for (const id of optionIds) {
        if (anySelected) next.delete(id)
        else next.add(id)
      }
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

      <div className="w-full mx-auto px-5 py-5">
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
                      key={opt.ids[0]}
                      id={`attr-opt-${opt.ids[0]}`}
                      label={opt.value}
                      checked={opt.ids.some((id) => selectedOptionIds.has(id))}
                      onChange={() => toggleOption(opt.ids)}
                    />
                  ))}
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
              {/* total is the true server-side count for this category; falls back to the
                  page-scoped filteredProducts count once a client-side brand/attribute filter
                  narrows further, since that narrowing only applies within the current page. */}
              <span className="text-[14px] text-[#212121]">
                {selectedBrands.size > 0 || selectedOptionIds.size > 0 ? filteredProducts.length : total} Products
              </span>
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
