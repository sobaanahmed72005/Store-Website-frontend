import ProductCard from './ProductCard'
import { resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'

// The `<ProductCard {...getEffectivePrice(p)} />` block, hand-copied across every product-listing
// page (Products, Shop, CategoryListing, SearchResults). `className` lets a page override the
// grid's column count/gap (SearchResults uses a 5-column layout, the rest use 4).
export default function ProductGrid({ products, className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2' }) {
  return (
    <div className={className}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          slug={p.slug}
          title={p.name}
          image={resolveImageUrl(p.image)}
          images={p.images?.map(resolveImageUrl)}
          stock={p.stock}
          hasVariants={p.has_variants}
          rating={p.rating}
          {...getEffectivePrice(p)}
        />
      ))}
    </div>
  )
}
