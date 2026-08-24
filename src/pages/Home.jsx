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

function diversifyProductsBySubCategory(products) {
  if (!Array.isArray(products) || products.length === 0) return []

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

  const parentMap = new Map()
  for (const subGroup of subCatMap.values()) {
    const pId = subGroup.parentId
    if (!parentMap.has(pId)) {
      parentMap.set(pId, [])
    }
    parentMap.get(pId).push(subGroup)
  }

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

let homeCache = {
  featured: null,
  newArrivals: null,
  onSale: null,
}

const DEFAULT_SEO_CONTENT = {
  title: "Pakistan's Premier IT Hardware & Technology Store",
  intro:
    "Welcome to IT Solutions — your authorized supplier of genuine IT equipment, office networking solutions, surveillance systems, and high-performance computing hardware in Pakistan. Whether you are setting up home security or equipping a modern corporate office, we offer competitive pricing, official brand warranty, and fast nationwide Cash on Delivery.",
  columns: [
    {
      heading: 'Laptops & Computing',
      description:
        'Explore Apple MacBook, Dell XPS, HP ProBook, Lenovo ThinkPad, and ASUS ROG gaming laptops with official international warranty and authentic power adapters.',
    },
    {
      heading: '4K Security & Surveillance',
      description:
        'Secure your home and business with Hikvision, EZVIZ, and IMOU 4K security cameras, wireless PTZ dome cameras, NVR recording units, and smart night-vision sensors.',
    },
    {
      heading: 'Networking & Solar Energy',
      description:
        'Upgrade your connectivity with Wi-Fi 6 Gigabit routers, enterprise switches, and hybrid solar inverters for continuous uninterrupted power supply.',
    },
  ],
}

function HomeSeoContentSection() {
  const [seoContent, setSeoContent] = useState(DEFAULT_SEO_CONTENT)

  useEffect(() => {
    api
      .get(ENDPOINTS.CONTENT.HOMEPAGE_SEO)
      .then((data) => {
        if (!data || typeof data !== 'object') return
        setSeoContent({
          title: data.title || DEFAULT_SEO_CONTENT.title,
          intro: data.intro || DEFAULT_SEO_CONTENT.intro,
          columns: Array.isArray(data.columns) && data.columns.length > 0 ? data.columns : DEFAULT_SEO_CONTENT.columns,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <section className="bg-white border-t border-b border-slate-200/80 py-8 sm:py-10 my-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#0c4a6e] font-heading tracking-tight mb-3">
          {seoContent.title}
        </h2>
        <p className="text-[13px] sm:text-[14px] text-slate-600 leading-relaxed mb-6 max-w-4xl">
          {seoContent.intro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-[13px] text-slate-600">
          {(seoContent.columns || []).map((col, idx) => (
            <div key={idx}>
              <h3 className="font-bold text-[#0c4a6e] text-[15px] font-heading mb-1.5">
                {col.heading}
              </h3>
              <p className="leading-relaxed">{col.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { siteName, logoUrl } = useSiteSettings()
  const [featured, setFeatured] = useState(homeCache.featured || [])
  const [newArrivals, setNewArrivals] = useState(homeCache.newArrivals || [])
  const [onSale, setOnSale] = useState(homeCache.onSale || [])
  const [loading, setLoading] = useState(!homeCache.featured)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

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
    description: `Shop original 4K CCTV security cameras, enterprise Wi-Fi 6 routers, solar panels, and laptops in Pakistan at ${siteName || 'IT Solutions'}. Official warranty & fast nationwide delivery on your order!`,
    canonical: `${origin}/`,
    image: logoUrl,
    keywords: 'cctv camera pakistan, 4k cctv camera price lahore, wifi 6 router pakistan, solar panel price pakistan, laptops online store pakistan, it solutions lahore',
    publisher: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: siteName || 'IT Solutions Trade & Service Pvt. Ltd.',
        url: origin,
        logo: logoUrl || undefined,
        description: 'Pakistan\'s trusted online IT store for laptops, 4K CCTV security cameras, Wi-Fi 6 routers, and solar power inverters.',
        priceRange: 'PKR',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lahore',
          addressRegion: 'Punjab',
          addressCountry: 'PK',
        },
        paymentAccepted: 'Cash on Delivery, Bank Transfer, Credit Card',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName || 'IT Solutions',
        url: origin,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Does IT Solutions deliver laptops & CCTV cameras all over Pakistan?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! IT Solutions offers nationwide Cash on Delivery (COD) and fast shipping to Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and all cities across Pakistan.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are all products at IT Solutions 100% original with official warranty?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'All products sold at IT Solutions are 100% genuine brand-new items backed by official brand manufacturer warranty and a 7-day replacement guarantee.',
            },
          },
          {
            '@type': 'Question',
            name: 'What tech products and brands can I buy at IT Solutions?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'IT Solutions offers laptops, 4K CCTV security cameras (Hikvision, EZVIZ, IMOU), enterprise Wi-Fi 6 routers (TP-Link, Asus, Netgear), solar inverters, and PC components from Apple, Dell, HP, Lenovo, ASUS, and Samsung.',
            },
          },
        ],
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
      <HomeSeoContentSection />
      <Footer />

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  )
}
