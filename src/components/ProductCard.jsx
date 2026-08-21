import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWishlistStore, useIsWishlisted } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useCurrencyStore, parsePkr } from '../store/currencyStore'
import { useCompareStore } from '../store/compareStore'
import { triggerFlyToCart } from './cart/FlyingCartAnimation'
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
  onQuickView,
}) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, spotX: 50, spotY: 50 })
  const cardRef = useRef(null)

  const gallery = [...new Set([image, ...(images || [])].filter(Boolean))]
  const activeIndex = hovered && gallery.length > 1 ? 1 : 0

  const wishlistId = id ?? href ?? title
  const user = useAuthStore((s) => s.user)
  const wishlisted = useIsWishlisted(wishlistId)
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist)
  const addToCart = useCartStore((s) => s.addToCart)
  const addToCompare = useCompareStore((s) => s.addToCompare)
  const { format } = useCurrencyStore()
  const navigate = useNavigate()
  const pkrPrice = parsePkr(price)
  const actuallyInStock = stock != null ? stock > 0 : inStock
  const productHref = slug ? `/product/${slug}` : href || '/shop'

  const [isAdding, setIsAdding] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const ry = ((x - centerX) / centerX) * 8
    const rx = -((y - centerY) / centerY) * 8

    const spotX = (x / rect.width) * 100
    const spotY = (y / rect.height) * 100

    setTilt({ rx, ry, spotX, spotY })
  }

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ rx: 0, ry: 0, spotX: 50, spotY: 50 })
  }

  const handleAddToCart = async (e) => {
    if (isAdding || !actuallyInStock) return
    setIsAdding(true)

    if (e?.currentTarget) {
      triggerFlyToCart(e.currentTarget.getBoundingClientRect(), image)
    }

    try {
      addToCart({ id: wishlistId, title, image, price: pkrPrice, slug })
    } finally {
      setTimeout(() => setIsAdding(false), 250)
    }
  }

  const handleWishlistClick = async () => {
    if (!user) {
      navigate('/signin', { state: { from: window.location.pathname } })
      return
    }
    await toggleWishlist({ id: wishlistId, name: title, image, price: pkrPrice, stock, slug })
  }

  const handleCompareClick = () => {
    addToCompare({
      id: wishlistId,
      title,
      image,
      price: pkrPrice,
      slug,
      stock: stock != null ? stock : inStock,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: hovered
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(10px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        transition: hovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        willChange: 'transform',
      }}
      className="group relative w-full h-full flex flex-col bg-white rounded-[14px] overflow-hidden border border-gray-100/90 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/15"
    >
      {/* Dynamic Mouse Spotlight Glow Border */}
      {hovered && (
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(400px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(14, 165, 233, 0.12), transparent 80%)`,
          }}
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
        />
      )}

      {/* Product Image Stage with 3D Levitation translateZ */}
      <div className="relative w-full aspect-square bg-white overflow-hidden rounded-[14px] [transform-style:preserve-3d]">
        {(discountPercent || isNew || actuallyInStock) && (
          <div className="absolute left-[12px] top-[12px] z-10 flex flex-col items-start gap-1 pointer-events-none">
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

        {/* Action Icon Buttons Overlay */}
        <div className="absolute right-[12px] top-[12px] z-20 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleWishlistClick}
            className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              wishlisted
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'bg-white/95 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100'
            }`}
          >
            <HeartIcon size={16} filled={wishlisted} />
          </button>

          <button
            type="button"
            title="Quick View"
            aria-label="Quick View"
            onClick={() => onQuickView && onQuickView({ id: wishlistId, title, image, images, price, oldPrice, rating, stock, inStock, slug })}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/95 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 border border-slate-100 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            👁️
          </button>

          <button
            type="button"
            title="Add to Compare"
            aria-label="Add to Compare"
            onClick={handleCompareClick}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/95 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 border border-slate-100 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer text-xs"
          >
            ⚖️
          </button>
        </div>

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
                style={{
                  transform: hovered ? 'translateZ(25px) scale(1.06)' : 'translateZ(0px) scale(1)',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
                }}
                className={`absolute inset-0 w-full h-full object-contain ${
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

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4 z-10 bg-white">
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
              disabled={!actuallyInStock || isAdding}
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 rounded-full text-[13px] font-bold py-2.5 transition-all duration-200 shadow-md ${
                actuallyInStock
                  ? 'bg-cz-primary text-white hover:bg-cz-primary-hover hover:-translate-y-[1px] cursor-pointer hover:shadow-cyan-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isAdding ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Adding...</span>
                </>
              ) : actuallyInStock ? (
                'Add To Cart'
              ) : (
                'Out Of Stock'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
