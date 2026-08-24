import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import CategoryIcons from '../components/CategoryIcons'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'
import HomeBrandsChipsCarousel from '../components/HomeBrandsChipsCarousel'
import QuickViewModal from '../components/modals/QuickViewModal'
import { api } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import { SITE_TAGLINE } from '../config/seoDefaults'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

function SectionHeading({ heading, seeAllHref }) {
  return (
    <div className="flex items-center justify-between mb-[30px]">
      <h2 className="text-[24px] font-bold text-[#0c4a6e] font-heading tracking-tight">
        {heading}
      </h2>
      {seeAllHref && (
        <Link
          to={seeAllHref}
          className="text-[13px] font-medium text-cz-primary hover:underline"
        >
          See All →
        </Link>
      )}
    </div>
  )
}

function ProductSection({ heading, seeAllHref, products, loading, onQuickView }) {
  if (!loading && products.length === 0) return null
  return (
    <section className="mx-auto px-5 pt-[30px] pb-0 md:pb-[30px]">
      <SectionHeading heading={heading} seeAllHref={seeAllHref} />
      <ProductGrid
        products={products}
        loading={loading}
        skeletonCount={5}
        seeAllHref={seeAllHref}
        seeAllTitle={heading}
        onQuickView={onQuickView}
        className="grid grid-cols-2 md:grid-cols-5 gap-6"
      />
    </section>
  )
}

/**
 * Reorganizes products so that EXACTLY ONE product per sub-category appears on the homepage grid,
 * alternating across parent categories to showcase maximum variety without clutter.
 */
function diversifyProductsBySubCategory(products) {
  if (!Array.isArray(products) || products.length === 0) return []

  // 1. Pick the first product from each subcategory
  const subCatMap = new Map()
  for (const product of products) {
    const subKey = product.category_id || product.category_name || 'uncategorized'
    if (!subCatMap.has(subKey)) {
      subCatMap.set(subKey, {
        parentId: product.category_parent_id || subKey,
        subKey,
        item: product,
      })
    }
  }

  // 2. Group subcategories by their parent category
  const parentMap = new Map()
  for (const subGroup of subCatMap.values()) {
    const pId = subGroup.parentId
    if (!parentMap.has(pId)) {
      parentMap.set(pId, [])
    }
    parentMap.get(pId).push(subGroup)
  }

  // 3. Interleave 1 product per subcategory round-robin across parent categories
  const parentGroups = Array.from(parentMap.values())
  const result = []

  let maxSubCats = 0
  for (const group of parentGroups) {
    if (group.length > maxSubCats) maxSubCats = group.length
  }

  for (let i = 0; i < maxSubCats; i++) {
    for (const group of parentGroups) {
      if (group[i]) {
        result.push(group[i].item)
      }
    }
  }

  return result
}

// Module-level in-memory cache for instant zero-delay render on Back button navigation
let homeCache = {
  featured: null,
  newArrivals: null,
  onSale: null,
}

export default function Home() {
  const [featured, setFeatured] = useState(() => homeCache.featured || [])
  const [newArrivals, setNewArrivals] = useState(() => homeCache.newArrivals || [])
  const [onSale, setOnSale] = useState(() => homeCache.onSale || [])
  const [loading, setLoading] = useState(!homeCache.featured)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const { siteName, logoUrl } = useSiteSettings()

  useEffect(() => {
    api.get(ENDPOINTS.PRODUCTS.LIST('?limit=100'))
      .then((data) => {
        const res = diversifyProductsBySubCategory(data.products || [])
        homeCache.featured = res
        setFeatured(res)
        setLoading(false)
      })
      .catch(() => setFeatured([]))

    api.get(ENDPOINTS.PRODUCTS.LIST('?new_arrival=1&limit=50'))
      .then((data) => {
        const res = diversifyProductsBySubCategory(data.products || [])
        homeCache.newArrivals = res
        setNewArrivals(res)
      })
      .catch(() => setNewArrivals([]))

    api.get(ENDPOINTS.PRODUCTS.LIST('?on_sale=1&limit=50'))
      .then((data) => {
        const res = diversifyProductsBySubCategory(data.products || [])
        homeCache.onSale = res
        setOnSale(res)
      })
      .catch(() => setOnSale([]))
  }, [])

  const origin = window.location.origin
  useSeo({
    title: `${siteName || 'IT Solutions'} — 4K CCTV Cameras, Wi-Fi Routers, Solar Systems & Laptops in Pakistan`,
    description: `Shop original 4K CCTV security cameras, enterprise Wi-Fi 6 routers, solar panels, and laptops in Pakistan at ${siteName || 'IT Solutions'}. Official warranty & free nationwide delivery on your 1st order!`,
    canonical: `${origin}/`,
    image: logoUrl,
    keywords: 'cctv camera pakistan, 4k cctv camera price lahore, wifi 6 router pakistan, solar panel price pakistan, laptops online store pakistan, it solutions lahore',
    publisher: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
        url: origin,
        logo: logoUrl || undefined,
        description: SITE_TAGLINE,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName || 'IT Solutions',
        url: origin,
      },
    ],
  })

  return (
    <div className="min-h-screen bg-cz-page">
      <h1 className="sr-only">{siteName || 'IT Solutions'} — Laptops, Gaming Gear & PC Components in Pakistan</h1>
      <SeoHeadingFiller h3="Shop by category" h4="Popular categories" h5="Store highlights" h6="Quick links" />
      <AnnouncementBar />
      <Navbar />
      <Header />
      <CategoryMenu />
      <Hero />
      <CategoryIcons />
      <HomeBrandsChipsCarousel />
      <ProductSection heading="Products" seeAllHref="/products?featured=1" products={featured} loading={loading} onQuickView={setQuickViewProduct} />
      <ProductSection heading="On Sale" seeAllHref="/products?on_sale=1" products={onSale} loading={loading} onQuickView={setQuickViewProduct} />
      <ProductSection heading="New Arrivals" seeAllHref="/products?new_arrival=1" products={newArrivals} loading={loading} onQuickView={setQuickViewProduct} />
      <Footer />

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  )
}
