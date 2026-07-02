import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import ProductCard, { StarRating } from '../components/ProductCard'
import { PlusCircleIcon, MinusCircleIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useCurrency, parsePkr } from '../context/CurrencyContext'
import { api, resolveImageUrl } from '../api/client'
import { getEffectivePrice } from '../utils/pricing'

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Product not found</h1>
        <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
          This product may have been removed or the link is incorrect.
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

function Gallery({ images, title }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-[10px] bg-cz-gold-light flex items-center justify-center">
        <span className="text-[13px] text-[#9ca3af]">No image</span>
      </div>
    )
  }

  const showPrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const showNext = () => setActiveIndex((i) => (i + 1) % images.length)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square rounded-[10px] bg-white border border-[#dedede] overflow-hidden">
        <img src={images[activeIndex]} alt={title} className="w-full h-full object-contain" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={showPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm text-[#212121] hover:text-cz-primary"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm text-[#212121] hover:text-cz-primary"
            >
              <ChevronRightIcon size={18} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-md border overflow-hidden ${
                i === activeIndex ? 'border-cz-primary' : 'border-[#dedede]'
              }`}
            >
              <img src={src} alt={`${title} ${i + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className={`text-[22px] leading-none cursor-pointer ${n <= value ? 'text-[#FF9C05]' : 'text-[#d1d5db]'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart, closeCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { format } = useCurrency()

  const [product, setProduct] = useState(null)
  const [checked, setChecked] = useState(false)
  const [qty, setQty] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 })
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewEligibility, setReviewEligibility] = useState(null)

  useEffect(() => {
    setChecked(false)
    setQty(1)
    setReviewForm({ rating: 0, comment: '' })
    setReviewError('')
    setReviewSubmitted(false)
    api
      .get(`/products/${slug}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setChecked(true))
  }, [slug])

  useEffect(() => {
    if (!product) return
    api
      .get(`/reviews?product_id=${product.id}`)
      .then((data) => {
        setReviews(data.reviews)
        setReviewStats({ average: data.average, count: data.count })
      })
      .catch(() => {})

    if (product.category_slug) {
      api
        .get(`/products?category=${product.category_slug}`)
        .then((data) => setRelatedProducts(data.filter((p) => p.id !== product.id).slice(0, 4)))
        .catch(() => setRelatedProducts([]))
    }

    if (user) {
      api
        .get(`/reviews/eligibility?product_id=${product.id}`, { auth: true })
        .then(setReviewEligibility)
        .catch(() => setReviewEligibility(null))
    } else {
      setReviewEligibility(null)
    }
  }, [product, user])

  const galleryImages = useMemo(() => {
    if (!product) return []
    const list = [product.image, ...(product.images || [])].filter(Boolean).map(resolveImageUrl)
    return [...new Set(list)]
  }, [product])

  if (!checked) return null
  if (!product) return <ProductNotFound />

  const { price, oldPrice, discountPercent } = getEffectivePrice(product)
  const pkrPrice = parsePkr(price)
  const inStock = product.stock > 0
  const wishlisted = isWishlisted(product.id)

  const cartPayload = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    image: resolveImageUrl(product.image),
    price: pkrPrice,
  }

  const handleWishlistClick = async () => {
    if (!user) {
      navigate('/signin', { state: { from: window.location.pathname } })
      return
    }
    await toggleWishlist({ id: product.id, slug: product.slug, name: product.name, image: resolveImageUrl(product.image), price: pkrPrice, stock: product.stock })
  }

  const handleAddToCart = () => addToCart(cartPayload, qty)

  const handleBuyNow = () => {
    addToCart(cartPayload, qty)
    closeCart()
    navigate('/checkout')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewForm.rating) {
      setReviewError('Please select a star rating.')
      return
    }
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await api.post('/reviews', { product_id: product.id, rating: reviewForm.rating, comment: reviewForm.comment }, { auth: true })
      setReviewSubmitted(true)
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5 w-full">
        <div className="flex items-center gap-2 mb-4 text-[13px] flex-wrap">
          <span className="opacity-70 hover:underline after:content-['/'] after:ml-2 after:opacity-70">
            <Link to="/">Home</Link>
          </span>
          {product.category_slug && (
            <span className="opacity-70 hover:underline after:content-['/'] after:ml-2 after:opacity-70">
              <Link to={`/category/${product.category_slug}`}>{product.category_name}</Link>
            </span>
          )}
          <span className="text-[#212121]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Gallery images={galleryImages} title={product.name} />

          <div className="flex flex-col gap-4">
            <div>
              {product.brand && <div className="text-[13px] text-[#4b4b4b] mb-1">{product.brand}</div>}
              <h1 className="text-[24px] font-semibold text-[#212121]">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(reviewStats.average)} />
                <span className="text-[13px] text-[#4b4b4b]">
                  {reviewStats.count > 0 ? `${reviewStats.average.toFixed(1)} (${reviewStats.count} review${reviewStats.count === 1 ? '' : 's'})` : 'No reviews yet'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[28px] font-semibold text-[#3d3d3d]">{format(pkrPrice)}</span>
              {oldPrice && <span className="text-[16px] text-[#3d3d3d] opacity-70 line-through">{format(oldPrice)}</span>}
              {discountPercent && (
                <span className="rounded-[4px] bg-cz-lavender text-white text-[12px] font-semibold px-2.5 py-1">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            <span className={`text-[14px] font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>

            {product.description && <p className="text-[14px] text-[#4b4b4b] leading-relaxed">{product.description}</p>}

            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-[#212121]">Quantity</span>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-[#212121]">
                    <MinusCircleIcon size={22} />
                  </button>
                  <span className="text-[14px] text-[#212121] w-8 text-center">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="text-[#212121]"
                  >
                    <PlusCircleIcon size={22} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`rounded-full text-[14px] font-semibold px-8 py-3 transition-colors ${
                  inStock ? 'bg-cz-primary text-white hover:bg-cz-primary-hover cursor-pointer' : 'bg-cz-primary text-white opacity-60 cursor-not-allowed'
                }`}
              >
                Add To Cart
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className={`rounded-full text-[14px] font-semibold px-8 py-3 border transition-colors ${
                  inStock ? 'border-cz-primary text-cz-primary hover:bg-cz-gold-light cursor-pointer' : 'border-[#dedede] text-[#9ca3af] cursor-not-allowed'
                }`}
              >
                Buy It Now
              </button>
              <button
                type="button"
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={handleWishlistClick}
                className={`flex items-center justify-center w-12 h-12 rounded-full border border-[#dedede] transition-colors ${
                  wishlisted ? 'text-cz-lavender' : 'text-[#9ca3af] hover:text-cz-lavender'
                }`}
              >
                <HeartIcon size={20} filled={wishlisted} />
              </button>
            </div>

            {product.specifications?.length > 0 && (
              <div className="mt-2">
                <h2 className="text-[16px] font-semibold text-[#212121] mb-2">Specifications</h2>
                <div className="rounded-[8px] border border-[#dedede] overflow-hidden">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className={`flex text-[14px] ${i > 0 ? 'border-t border-[#dedede]' : ''}`}>
                      <span className="w-1/3 bg-cz-gold-light px-4 py-2.5 text-[#4b4b4b]">{spec.attribute}</span>
                      <span className="flex-1 px-4 py-2.5 text-[#212121]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 max-w-[800px]">
          <h2 className="text-[18px] font-semibold text-[#212121] mb-4">Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-[14px] text-[#4b4b4b] mb-6">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4 mb-6">
              {reviews.map((r) => (
                <div key={r.id} className="border border-[#dedede] rounded-[8px] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-[#212121]">{r.author_name}</span>
                    <span className="text-[12px] text-[#9ca3af]">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} size={13} />
                  {r.comment && <p className="text-[14px] text-[#4b4b4b] mt-2">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {user ? (
            reviewSubmitted ? (
              <div className="rounded-[8px] bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-[14px] font-medium text-green-700">Thank you for your review!</p>
                <p className="text-[13px] text-green-600 mt-1">It will appear on this page once approved by our team.</p>
              </div>
            ) : reviewEligibility?.alreadyReviewed ? (
              <p className="text-[14px] text-[#4b4b4b]">You've already reviewed this product.</p>
            ) : reviewEligibility && !reviewEligibility.purchased ? (
              <p className="text-[14px] text-[#4b4b4b]">You can write a review after purchasing this product.</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 border border-[#dedede] rounded-[8px] p-4">
                <span className="text-[14px] font-medium text-[#212121]">Write a Review</span>
                {reviewError && <div className="text-[13px] text-red-600">{reviewError}</div>}
                <StarPicker value={reviewForm.rating} onChange={(rating) => setReviewForm((prev) => ({ ...prev, rating }))} />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  placeholder="Share your experience with this product (optional)"
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="self-start rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )
          ) : (
            <p className="text-[14px] text-[#4b4b4b]">
              <Link to="/signin" state={{ from: window.location.pathname }} className="text-cz-primary hover:underline">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[18px] font-semibold text-[#212121] mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  title={p.name}
                  image={resolveImageUrl(p.image)}
                  stock={p.stock}
                  rating={p.rating}
                  {...getEffectivePrice(p)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}