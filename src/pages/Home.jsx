import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AnnouncementBar from '../components/AnnouncementBar'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import CategoryIcons from '../components/CategoryIcons'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import { api, resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { SITE_TAGLINE } from '../config/seoDefaults'

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
    <section className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 pt-[30px] pb-0 md:pb-[30px]">
      <SectionHeading heading={heading} seeAllHref={seeAllHref} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-[10px]">
        {products.map((p) => (
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
    </section>
  )
}

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [onSale, setOnSale] = useState([])
  const { siteName, logoUrl } = useSiteSettings()

  useEffect(() => {
    api.get('/products?featured=1').then(setFeatured).catch(() => setFeatured([]))
    api.get('/products?new_arrival=1').then(setNewArrivals).catch(() => setNewArrivals([]))
    api.get('/products?on_sale=1').then(setOnSale).catch(() => setOnSale([]))
  }, [])

  const origin = window.location.origin
  useSeo({
    title: siteName || 'IT Network',
    description: SITE_TAGLINE,
    canonical: `${origin}/`,
    image: logoUrl,
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
