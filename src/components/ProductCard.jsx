import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCurrency, parsePkr } from '../context/CurrencyContext'
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
}) {
  const [hovered, setHovered] = useState(false)
  const gallery = [...new Set([image, ...(images || [])].filter(Boolean))]
  const activeIndex = hovered && gallery.length > 1 ? 1 : 0
  const { user } = useAuth()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { format } = useCurrency()
  const navigate = useNavigate()
  const wishlistId = id ?? href ?? title
  const wishlisted = isWishlisted(wishlistId)
  const pkrPrice = parsePkr(price)
  const actuallyInStock = stock != null ? stock > 0 : inStock
  const productHref = slug ? `/product/${slug}` : href || '/products'

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
      className="w-full h-full flex flex-col bg-white rounded-[10px] overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full aspect-square bg-white overflow-hidden rounded-[10px]">
        {(discountPercent || isNew) && (
          <div className="absolute left-[15px] top-[15px] z-10 flex flex-col items-start gap-[5px]">
            {discountPercent ? (
              <span className="rounded-[4px] bg-cz-lavender text-white text-[11px] font-semibold px-2.5 py-[3px]">
                {discountPercent}% Off
              </span>
            ) : null}
            {isNew && (
              <span className="rounded-[4px] bg-cz-accent text-cz-ink text-[11px] font-semibold px-2.5 py-[3px]">
                New
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlistClick}
          className={`absolute right-[15px] top-[15px] z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm transition-colors cursor-pointer ${
            wishlisted ? 'text-cz-lavender' : 'text-[#9ca3af] hover:text-cz-lavender'
          }`}
        >
          <HeartIcon size={17} filled={wishlisted} />
        </button>

        <Link to={productHref} className="absolute inset-0">
          {gallery.length > 0 ? (
            gallery.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={title}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
                  i === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[12px] text-[#9ca3af]">No image</span>
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-[5px] py-[10px] px-1">
        <div className="flex flex-col gap-[5px]">
          <Link
            to={productHref}
            className="text-[13px] leading-[1.4] font-medium text-[#3d3d3d] line-clamp-3 cursor-pointer hover:text-cz-primary"
          >
            {title}
          </Link>
          <StarRating rating={rating} />
        </div>

        <div className="flex flex-col gap-[5px]">
          <div className="flex flex-wrap items-center gap-[5px]">
            <span className="text-[20px] font-semibold text-[#3d3d3d]">{format(pkrPrice)}</span>
            {oldPrice && (
              <span className="text-[14px] text-[#3d3d3d] opacity-70 line-through">
                {format(oldPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!actuallyInStock}
            onClick={() => addToCart({ id: wishlistId, title, image, price: pkrPrice, slug })}
            className={`w-full rounded-full text-[14px] font-semibold py-[10px] transition-colors ${
              actuallyInStock
                ? 'bg-cz-primary text-white hover:bg-cz-primary-hover cursor-pointer'
                : 'bg-cz-primary text-white cursor-not-allowed opacity-60'
            }`}
          >
            {actuallyInStock ? 'Add To Cart' : 'Out Of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}
