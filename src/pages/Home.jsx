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
import { api } from '../api/client'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import { SITE_TAGLINE } from '../config/seoDefaults'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

function SectionHeading({ heading, seeAllHref }) {
  return (
    <div className="flex items-center justify-between mb-[30px]">
      <h2 className="text-[24px] font-semibold font-heading" style={{ color: '#353535' }}>
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

function ProductSection({ heading, seeAllHref, products }) {
  if (products.length === 0) return null
  return (
    <section className="mx-auto px-5 pt-[30px] pb-0 md:pb-[30px]">
      <SectionHeading heading={heading} seeAllHref={seeAllHref} />
      <ProductGrid products={products} className="grid grid-cols-2 md:grid-cols-5 gap-[10px]" />
    </section>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [onSale, setOnSale] = useState([])
  const { siteName, logoUrl } = useSiteSettings()

  useEffect(() => {
    // GET /products now returns { products, page, limit, total, totalPages } instead of a bare
    // array — these homepage teaser sections only ever show the first page's worth anyway.
    api.get('/products?featured=1').then((data) => setFeatured(data.products)).catch(() => setFeatured([]))
    api.get('/products?new_arrival=1').then((data) => setNewArrivals(data.products)).catch(() => setNewArrivals([]))
    api.get('/products?on_sale=1').then((data) => setOnSale(data.products)).catch(() => setOnSale([]))
  }, [])

  const origin = window.location.origin
  useSeo({
    title: `${siteName || 'IT Network'} — Laptops, Gaming Gear & PC Components in Pakistan`,
    description: SITE_TAGLINE,
    canonical: `${origin}/`,
    image: logoUrl,
    keywords: 'laptops in Pakistan, gaming PC, PC components, buy laptop online, computer store Pakistan',
    publisher: siteName || 'IT Network',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName || 'IT Network',
        url: origin,
        logo: logoUrl || undefined,
        description: SITE_TAGLINE,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName || 'IT Network',
        url: origin,
      },
    ],
  })

  return (
    <div className="min-h-screen bg-cz-page">
      {/* Real, crawlable page heading — the visual hero below is a rotating admin-editable
          carousel (multiple slides in the DOM at once), so it can't reliably serve as the
          page's single h1 without risking more than one on the page. */}
      <h1 className="sr-only">{siteName || 'IT Network'} — Laptops, Gaming Gear & PC Components in Pakistan</h1>
      <SeoHeadingFiller h3="Shop by category" h4="Popular categories" h5="Store highlights" h6="Quick links" />
      <AnnouncementBar />
      <Navbar />
      <Header />
      <CategoryMenu />
      <Hero />
      <CategoryIcons />
      <ProductSection heading="Featured Products" seeAllHref="/products?featured=1" products={featured} />
      <ProductSection heading="On Sale" seeAllHref="/products?on_sale=1" products={onSale} />
      <ProductSection heading="New Arrivals" seeAllHref="/products?new_arrival=1" products={newArrivals} />
      <Footer />
    </div>
  )
}
