import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlistStore, useIsWishlisted } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useCurrencyStore, parsePkr } from '../store/currencyStore'
import { HeartIcon } from './icons'

const STAR_PATH =
  'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'

export function StarRating({ rating = 0, count = 5, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }, (_, i) => {
        const filled = i < rating
        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#FF9C05"
            fill={filled ? '#FF9C05' : 'none'}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
          </svg>
        )
      })}
    </div>
  )
}

export default function ProductCard({
  id,
  href,
  slug,
  image,
  images,
  title,
  rating = 0,
  price,
  oldPrice,
  discountPercent,
  isNew = false,
  stock,
  inStock = true,
  hasVariants = false,
}) {
  const [hovered, setHovered] = useState(false)
  const gallery = [...new Set([image, ...(images || [])].filter(Boolean))]
  const activeIndex = hovered && gallery.length > 1 ? 1 : 0
  // Selectors, not whole-store subscriptions — this card is rendered many times per page (grids
  // of 12-24), so it should only re-render when something it actually displays changes: whether
  // THIS product is wishlisted (not the whole wishlist), never on unrelated cart/wishlist
  // mutations elsewhere on the page (e.g. someone changing quantity in the header's mini-cart).
  const wishlistId = id ?? href ?? title
  const user = useAuthStore((s) => s.user)
  const wishlisted = useIsWishlisted(wishlistId)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const addToCart = useCartStore((s) => s.addToCart)
  const { format } = useCurrencyStore()
  const navigate = useNavigate()
  const pkrPrice = parsePkr(price)
  const actuallyInStock = stock != null ? stock > 0 : inStock
  const productHref = slug ? `/product/${slug}` : href || '/shop'

  const handleWishlistClick = async () => {
    if (!user) {
      navigate('/signin', { state: { from: window.location.pathname } })
      return
    }
    await toggleWishlist({ id: wishlistId, name: title, image, price: pkrPrice, stock, slug })
  }

  const handleMouseLeave = () => {
    setHovered(false)
  }

  return (
    <div
      className="group w-full h-full flex flex-col bg-white rounded-[10px] overflow-hidden border border-gray-100/80 shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full aspect-square bg-white overflow-hidden rounded-[10px]">
        {(discountPercent || isNew || actuallyInStock) && (
          <div className="absolute left-[12px] top-[12px] z-10 flex flex-col items-start gap-1">
            {discountPercent ? (
              <span className="rounded-full bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-[3px] shadow-sm tracking-wide">
                {discountPercent}% OFF
              </span>
            ) : null}
            {isNew && (
              <span className="rounded-full bg-sky-500 text-white text-[11px] font-bold px-2.5 py-[3px] shadow-sm tracking-wide">
                NEW
              </span>
            )}
            {actuallyInStock && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-semibold px-2.5 py-[2px] shadow-sm border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                In Stock
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlistClick}
          className={`absolute right-[12px] top-[12px] z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/95 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100'
          }`}
        >
          <HeartIcon size={16} filled={wishlisted} />
        </button>

        <Link to={productHref} className="absolute inset-0 overflow-hidden">
          {gallery.length > 0 ? (
            gallery.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={title}
                width={400}
                height={400}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${
                  i === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-400">No image</span>
          )}
          <span className="sr-only">{title}</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <Link
            to={productHref}
            className="text-[14px] leading-snug font-semibold text-slate-800 line-clamp-2 cursor-pointer hover:text-cz-primary transition-colors"
          >
            {title}
          </Link>
          <StarRating rating={rating} />
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-slate-900 tracking-tight">{format(pkrPrice)}</span>
            {oldPrice && (
              <span className="text-[13px] text-slate-400 font-normal line-through">
                {format(oldPrice)}
              </span>
            )}
          </div>

          {hasVariants ? (
            <Link
              to={productHref}
              className="w-full flex items-center justify-center rounded-full text-[13px] font-bold py-2.5 border-2 border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white transition-all duration-200 hover:-translate-y-[1px] cursor-pointer shadow-sm"
            >
              View Options
            </Link>
          ) : (
            <button
              type="button"
              disabled={!actuallyInStock}
              onClick={() => addToCart({ id: wishlistId, title, image, price: pkrPrice, slug })}
              className={`w-full rounded-full text-[13px] font-bold py-2.5 transition-all duration-200 shadow-md ${
                actuallyInStock
                  ? 'bg-cz-primary text-white hover:bg-cz-primary-hover hover:-translate-y-[1px] cursor-pointer hover:shadow-cyan-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {actuallyInStock ? 'Add To Cart' : 'Out Of Stock'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
