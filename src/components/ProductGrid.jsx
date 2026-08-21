import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import ProductCard from './ProductCard'
import ProductSkeleton from './skeletons/ProductSkeleton'
import { resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'

export default function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 8,
  className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6',
  seeAllHref,
  seeAllTitle,
  onQuickView,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (loading || !containerRef.current || products.length === 0) return

    const cards = containerRef.current.querySelectorAll('.masonry-product-card')
    if (cards.length === 0) return

    // React Bits Masonry: animateFrom="bottom" GSAP Stagger Effect
    gsap.fromTo(
      cards,
      {
        opacity: 0,
        y: 120,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.05,
        overwrite: 'auto',
      }
    )
  }, [products, loading])

  if (loading) {
    return (
      <div className={className}>
        <ProductSkeleton count={skeletonCount} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={className}>
      {products.map((p) => (
        <div key={p.id} className="masonry-product-card w-full h-full">
          <ProductCard
            id={p.id}
            slug={p.slug}
            title={p.name}
            image={resolveImageUrl(p.image)}
            images={p.images?.map(resolveImageUrl)}
            stock={p.stock}
            hasVariants={p.has_variants}
            rating={p.rating}
            onQuickView={onQuickView}
            {...getEffectivePrice(p)}
          />
        </div>
      ))}
      {seeAllHref && (
        <div className="masonry-product-card w-full h-full">
          <Link
            to={seeAllHref}
            className="group relative flex flex-col items-center justify-center p-6 rounded-[10px] border border-dashed border-[#0ea5e9]/40 bg-gradient-to-b from-white via-[#f0f9ff] to-[#e0f2fe] hover:from-[#e0f2fe] hover:to-[#bae6fd] transition-all duration-300 shadow-sm hover:shadow-md text-center h-full min-h-[260px] cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 group-hover:bg-[#0284c7] transition-all duration-300">
              <svg
                className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>

            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0f172a] mb-1 group-hover:text-[#0284c7] transition-colors">
              View All {seeAllTitle || 'Products'}
            </h3>
            <p className="text-[12px] text-[#64748b] mb-4">
              Explore full collection
            </p>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0ea5e9] group-hover:bg-[#0284c7] text-white text-[12px] font-semibold px-4 py-2 transition-all shadow-sm group-hover:shadow-md">
              <span>Explore All</span>
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
