import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { StarRating } from '../components/ProductCard'
import ProductGrid from '../components/ProductGrid'
import { PlusCircleIcon, MinusCircleIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, PlayIcon } from '../components/icons'
import { useAuth } from '../store/authStore'
import { useCart } from '../store/cartStore'
import { useWishlist } from '../store/wishlistStore'
import { useCurrency, parsePkr } from '../store/currencyStore'
import { api, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { getEffectivePrice, getVariantEffectivePrice } from '../utils/pricing'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-5">
        <h1 className="text-[20px] font-semibold text-[#212121] mb-2">Product not found</h1>
        <p className="text-[14px] text-[#4b4b4b] mb-6 max-w-[420px]">
          This product may have been removed or the link is incorrect.
        </p>
        <Link
          to="/shop"
          className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
        >
          Browse All Products
        </Link>
      </div>
      <Footer />
    </div>
  )
}

function Gallery({ items, title }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [items])

  if (items.length === 0) {
    return (
      <div className="w-full aspect-square rounded-[10px] bg-cz-gold-light flex items-center justify-center">
        <span className="text-[13px] text-[#9ca3af]">No image</span>
      </div>
    )
  }

  const showPrev = () => setActiveIndex((i) => (i - 1 + items.length) % items.length)
  const showNext = () => setActiveIndex((i) => (i + 1) % items.length)
  const active = items[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square rounded-[10px] bg-white border border-[#dedede] overflow-hidden">
        {active.type === 'video' ? (
          <video src={active.src} controls width={400} height={400} className="w-full h-full object-contain bg-black" />
        ) : (
          <img src={active.src} alt={title} width={400} height={400} fetchPriority="high" className="w-full h-full object-contain" />
        )}
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={showPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm text-[#212121] hover:text-cz-primary"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-sm text-[#212121] hover:text-cz-primary"
            >
              <ChevronRightIcon size={18} />
            </button>
          </>
        )}
      </div>
      {items.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto">
          {items.map((item, i) => (
            <button
              key={item.src + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-16 h-16 rounded-md border overflow-hidden ${
                i === activeIndex ? 'border-cz-primary' : 'border-[#dedede]'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.src} width={64} height={64} className="w-full h-full object-cover bg-black" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                    <PlayIcon size={18} />
                  </span>
                </>
              ) : (
                <img src={item.src} alt={`${title} ${i + 1}`} width={64} height={64} loading="lazy" decoding="async" className="w-full h-full object-contain" />
              )}
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
  const { siteName } = useSiteSettings()

  const [product, setProduct] = useState(null)
  const [checked, setChecked] = useState(false)
  const [qty, setQty] = useState(1)
  const [selections, setSelections] = useState({})
  const [relatedProducts, setRelatedProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false)
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 })
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewEligibility, setReviewEligibility] = useState(null)

  useEffect(() => {
    setChecked(false)
    setQty(1)
    setSelections({})
    setReviewForm({ rating: 0, comment: '' })
    setReviewError('')
    setReviewSubmitted(false)
    api
      .get(ENDPOINTS.PRODUCTS.BY_SLUG(slug))
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setChecked(true))
  }, [slug])

  useEffect(() => {
    if (!product) return
    setReviewPage(1)
    api
      .get(ENDPOINTS.REVIEWS.LIST(`?product_id=${product.id}`))
      .then((data) => {
        setReviews(data.reviews)
        setReviewTotalPages(data.totalPages)
        setReviewStats({ average: data.average, count: data.total })
      })
      .catch((err) => console.error('Failed to load product reviews:', err))

    if (product.category_slug) {
      api
        .get(ENDPOINTS.PRODUCTS.BY_CATEGORY(product.category_slug))
        .then((data) => setRelatedProducts(data.products.filter((p) => p.id !== product.id).slice(0, 4)))
        .catch(() => setRelatedProducts([]))
    }

    if (user) {
      api
        .get(ENDPOINTS.REVIEWS.ELIGIBILITY(product.id), { auth: true })
        .then(setReviewEligibility)
        .catch(() => setReviewEligibility(null))
    } else {
      setReviewEligibility(null)
    }
  }, [product, user])

  const handleLoadMoreReviews = async () => {
    setLoadingMoreReviews(true)
    try {
      const nextPage = reviewPage + 1
      const data = await api.get(ENDPOINTS.REVIEWS.LIST(`?product_id=${product.id}&page=${nextPage}`))
      setReviews((prev) => [...prev, ...data.reviews])
      setReviewPage(nextPage)
    } catch (err) {
      console.error('Failed to load more product reviews:', err)
    } finally {
      setLoadingMoreReviews(false)
    }
  }

  const galleryImages = useMemo(() => {
    if (!product) return []
    const list = [product.image, ...(product.images || [])].filter(Boolean).map(resolveImageUrl)
    return [...new Set(list)]
  }, [product])

  // Separate from galleryImages (used for SEO/jsonLd, which only wants real image URLs) — this
  // is what the on-page Gallery actually renders, with the product video tacked on at the end.
  const galleryItems = useMemo(() => {
    const items = galleryImages.map((src) => ({ type: 'image', src }))
    if (product?.video) items.push({ type: 'video', src: resolveImageUrl(product.video) })
    return items
  }, [galleryImages, product])

  // Variant picker: derived straight from product.variants (already fully labeled by the
  // backend's attachVariants) — matched by (attribute name, value) pairs rather than raw option
  // ids, since a product only ever has one category so this is unambiguous and needs no second
  // fetch of the category's attribute definitions.
  const dimensionNames = useMemo(() => {
    const names = new Set()
    for (const v of product?.variants || []) for (const o of v.options) names.add(o.attribute)
    return [...names]
  }, [product])

  const optionsByDimension = useMemo(() => {
    const map = new Map()
    for (const name of dimensionNames) {
      const values = new Set()
      for (const v of product?.variants || []) for (const o of v.options) if (o.attribute === name) values.add(o.value)
      map.set(name, [...values])
    }
    return map
  }, [dimensionNames, product])

  const hasVariants = (product?.variants?.length ?? 0) > 0

  const matchedVariant = useMemo(() => {
    if (!hasVariants || dimensionNames.length === 0) return null
    if (!dimensionNames.every((name) => selections[name])) return null
    return (
      product.variants.find((v) => dimensionNames.every((name) => v.options.some((o) => o.attribute === name && o.value === selections[name]))) ??
      null
    )
  }, [product, selections, dimensionNames, hasVariants])

  const fullySelected = !hasVariants || matchedVariant != null

  const origin = window.location.origin
  const canonical = `${origin}/product/${slug}`
  useSeo({
    title: product ? `${product.name} — Buy Online in Pakistan | ${siteName || 'IT Network'}` : undefined,
    description: product?.description ? product.description.slice(0, 155) : undefined,
    canonical: product ? canonical : undefined,
    image: galleryImages[0],
    keywords: product ? `${product.name.toLowerCase()}, ${product.brand || ''}, buy online Pakistan`.replace(', ,', ',') : undefined,
    publisher: product ? siteName || 'IT Network' : undefined,
    noindex: !product,
    jsonLd: product
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: galleryImages,
            description: product.description || undefined,
            brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
            sku: String(product.id),
            offers: {
              '@type': 'Offer',
              url: canonical,
              priceCurrency: 'PKR',
              price: parsePkr(getEffectivePrice(product).price),
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
            ...(reviewStats.count > 0
              ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviewStats.average, reviewCount: reviewStats.count } }
              : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              ...(product.category_slug
                ? [{ '@type': 'ListItem', position: 2, name: product.category_name, item: `${origin}/category/${product.category_slug}` }]
                : []),
              { '@type': 'ListItem', position: product.category_slug ? 3 : 2, name: product.name, item: canonical },
            ],
          },
        ]
      : undefined,
  })

  if (!checked) return null
  if (!product) return <ProductNotFound />

  const { price, oldPrice, discountPercent } = matchedVariant ? getVariantEffectivePrice(matchedVariant) : getEffectivePrice(product)
  const pkrPrice = parsePkr(price)
  const displayStock = matchedVariant ? matchedVariant.stock : product.stock
  const inStock = fullySelected && displayStock > 0
  const wishlisted = isWishlisted(product.id)
  const variantLabel = matchedVariant ? dimensionNames.map((name) => selections[name]).join(' / ') : null

  const cartPayload = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    image: resolveImageUrl(product.image),
    price: pkrPrice,
    variantId: matchedVariant?.id ?? null,
    variantLabel,
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
      await api.post(ENDPOINTS.REVIEWS.BASE, { product_id: product.id, rating: reviewForm.rating, comment: reviewForm.comment }, { auth: true })
      setReviewSubmitted(true)
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="mx-auto px-5 py-5 w-full">
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
          <Gallery items={galleryItems} title={product.name} />

          <div className="flex flex-col gap-4">
            <div>
              {product.brand && <div className="text-[13px] text-[#4b4b4b] mb-1">{product.brand}</div>}
              <h1 className="text-[24px] font-semibold text-[#212121]">{product.name}</h1>
              <SeoHeadingFiller h3="Product details" h4="Delivery and returns" h5="Product gallery" h6="Wishlist and sharing" />
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
                <span className="rounded-[4px] bg-cz-lavender text-cz-ink text-[12px] font-semibold px-2.5 py-1">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            {fullySelected && (
              <span className={`text-[14px] font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                {inStock ? `In Stock (${displayStock} available)` : 'Out of Stock'}
              </span>
            )}

            {product.description && <p className="text-[14px] text-[#4b4b4b] leading-relaxed">{product.description}</p>}

            {dimensionNames.length > 0 && (
              <div className="flex flex-col gap-3">
                {dimensionNames.map((name) => (
                  <div key={name}>
                    <span className="block text-[13px] text-[#4b4b4b] mb-1.5">{name}</span>
                    <div className="flex flex-wrap gap-2">
                      {optionsByDimension.get(name).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelections((prev) => ({ ...prev, [name]: value }))}
                          className={`rounded-full border text-[13px] font-medium px-4 py-2 transition-colors ${
                            selections[name] === value
                              ? 'border-cz-primary bg-cz-primary text-white'
                              : 'border-[#dedede] text-[#212121] hover:border-cz-primary'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!matchedVariant && (
                  <span className="text-[13px] text-amber-700">
                    Please select {dimensionNames.join(' and ')} to see price and availability.
                  </span>
                )}
              </div>
            )}

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
                    onClick={() => setQty((q) => Math.min(displayStock, q + 1))}
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

          {reviewPage < reviewTotalPages && (
            <button
              type="button"
              onClick={handleLoadMoreReviews}
              disabled={loadingMoreReviews}
              className="mb-6 text-[13px] font-medium text-cz-primary hover:underline disabled:opacity-60"
            >
              {loadingMoreReviews ? 'Loading...' : 'Load More Reviews'}
            </button>
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
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}