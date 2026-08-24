import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { StarRating } from '../components/ProductCard'
import ProductGrid from '../components/ProductGrid'
import { PlusCircleIcon, MinusCircleIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, PlayIcon, FileTextIcon } from '../components/icons'
import { useAuth } from '../store/authStore'
import { useCart } from '../store/cartStore'
import { useWishlist } from '../store/wishlistStore'
import { useCurrency, parsePkr } from '../store/currencyStore'
import { api, BASE_URL, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { getEffectivePrice, getVariantEffectivePrice } from '../utils/pricing'
import { extractYoutubeId, getYoutubeThumbnail, getYoutubeWatchUrl } from '../utils/youtube'
import { useSeo } from '../hooks/useSeo'
import { useSiteSettings } from '../store/siteSettingsStore'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import Product3DCanvas from '../components/3d/Product3DCanvas'
import DepthGallery from '../components/3d/DepthGallery'
import { has3DModel } from '../utils/has3DModel'

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

function Gallery({ items, title, product }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewMode, setViewMode] = useState('depth') // 'depth' or '3d'
  const canShow3D = has3DModel(product)

  useEffect(() => {
    setActiveIndex(0)
    setViewMode('depth')
  }, [items])

  if (items.length === 0) {
    return (
      <div className="w-full aspect-square rounded-[10px] bg-slate-100 flex items-center justify-center">
        <span className="text-[13px] text-[#9ca3af]">No image</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Inline Gallery Mode Switcher Tabs - Only if custom uploaded 3D model exists */}
      {canShow3D && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('depth')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'depth'
                ? 'bg-[#0c4a6e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🖼 Photo Gallery
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-[#0c4a6e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧊 Interactive 3D View
          </button>
        </div>
      )}

      {/* Main Product Display Area */}
      <div className="relative w-full aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        {viewMode === 'depth' || !canShow3D ? (
          <div className="w-full h-full relative bg-white flex items-center justify-center overflow-hidden">
            <DepthGallery
              items={items}
              title={title}
              activeIndex={activeIndex}
              onSelectIndex={(idx) => setActiveIndex(idx)}
            />
          </div>
        ) : (
          <Product3DCanvas product={product} title={title} className="w-full h-full aspect-square bg-white" />
        )}
      </div>

      {/* Thumbnail Bar */}
      {items.length > 1 && (viewMode === 'depth' || !canShow3D) && (
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

  // The backend already normalizes content_video_url to a canonical youtube.com/watch?v=<id>
  // link on save, but this re-extracts the id rather than trusting the stored string directly —
  // the id is what actually drives the thumbnail src and the outbound link, so it's the one value
  // on this page that must always come from a validated 11-char match, never a raw string.
  const contentVideoId = useMemo(() => extractYoutubeId(product?.content_video_url), [product])

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

  // The matched variant's own description, when set, replaces the product's — same override
  // relationship as its price/stock above. Its key specs are additive on top of the product's own
  // (rather than replacing them): a variant-scoped spec is an extra fact specific to that
  // combination, not a substitute for the ones that hold true across every variant.
  const displayDescription = matchedVariant?.description || product?.description

  // Split into "Label: Value" pairs and plain-label bullets (see AdminProductForm's Key
  // Specifications editor) so they can render as two visually distinct groups instead of
  // interleaved — a value-less row sitting between two-column rows read as lopsided/broken.
  const combinedSpecifications = useMemo(() => {
    const variantExtra = (matchedVariant?.key_specs || []).map((s) => ({ attribute: s.label, value: s.value }))
    // A label the selected variant already provides (e.g. "Resolution") replaces the product's own
    // entry for that same label rather than sitting alongside it — the product-level value for a
    // variant-defining attribute is only ever a generic fallback (see attachAttributeOptionIds in
    // productsController.js), so once the matched variant has its own explicit value, showing both
    // would just duplicate the fact with the wrong one never actually going away on selection.
    const variantLabels = new Set(variantExtra.map((s) => s.attribute.trim().toLowerCase()))
    const base = (product?.specifications || []).filter((s) => !variantLabels.has(s.attribute.trim().toLowerCase()))
    return [...variantExtra, ...base]
  }, [product, matchedVariant])
  const specPairs = useMemo(() => combinedSpecifications.filter((s) => s.value), [combinedSpecifications])
  const specBullets = useMemo(() => combinedSpecifications.filter((s) => !s.value), [combinedSpecifications])

  const origin = window.location.origin
  const canonical = `${origin}/product/${slug}`
  useSeo({
    title: product ? `${product.name} — Buy Online in Pakistan | ${siteName || 'IT Solutions'}` : undefined,
    description: product?.description ? product.description.slice(0, 155) : undefined,
    canonical: product ? canonical : undefined,
    image: galleryImages[0],
    keywords: product ? `${product.name.toLowerCase()}, ${product.brand || ''}, buy online Pakistan`.replace(', ,', ',') : undefined,
    publisher: product ? siteName || 'IT Solutions' : undefined,
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="mx-auto px-5 py-8 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <Gallery items={galleryItems} title={product.name} product={product} />

          <div className="flex flex-col gap-5 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <div>
              {product.brand && (
                <div className="text-[13px] font-semibold text-[#0c4a6e] font-heading tracking-wider uppercase mb-1.5">
                  {product.brand}
                </div>
              )}
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0c4a6e] font-heading tracking-tight leading-snug">
                {product.name}
              </h1>
              <SeoHeadingFiller h3="Product details" h4="Delivery and returns" h5="Product gallery" h6="Wishlist and sharing" />
            </div>

            <div className="flex items-center gap-2.5">
              <StarRating rating={Math.round(reviewStats.average)} />
              <span className="text-[13px] font-medium text-slate-500">
                {reviewStats.count > 0 ? `${reviewStats.average.toFixed(1)} (${reviewStats.count} review${reviewStats.count === 1 ? '' : 's'})` : 'No reviews yet'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap pt-1">
              <span className="text-[28px] sm:text-[34px] font-bold text-[#0c4a6e] font-heading tracking-tight">{format(pkrPrice)}</span>
              {oldPrice && <span className="text-[16px] text-slate-400 font-medium line-through">{format(oldPrice)}</span>}
              {discountPercent && (
                <span className="rounded-full bg-cyan-50 border border-cyan-200 text-[#0c4a6e] text-[12px] font-bold px-3 py-1 shadow-sm">
                  {discountPercent}% Off
                </span>
              )}
            </div>

            {fullySelected && (
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold ${
                  inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {inStock ? `In Stock (${displayStock} available)` : 'Out of Stock'}
                </span>
              </div>
            )}

            {combinedSpecifications.length > 0 && (
              <div className="pt-2">
                <h2 className="text-[15px] font-bold text-slate-800 font-heading mb-3">Key Specifications</h2>
                {specPairs.length > 0 && (
                  <div className="rounded-xl border border-slate-200/90 shadow-sm overflow-hidden bg-white">
                    {specPairs.map((spec, i) => (
                      <div key={i} className={`flex text-[14px] ${i > 0 ? 'border-t border-slate-200/80' : ''} ${i % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}`}>
                        <span className="w-1/3 bg-slate-100/90 font-bold text-slate-800 px-4 py-2.5 border-r border-slate-200/80 shrink-0 font-heading">{spec.attribute}</span>
                        <span className="flex-1 font-medium text-slate-700 px-4 py-2.5">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {specBullets.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${specPairs.length > 0 ? 'mt-3' : ''}`}>
                    {specBullets.map((spec, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-cyan-200/80 bg-cyan-50/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#0c4a6e] shadow-sm hover:bg-cyan-100 transition-colors"
                      >
                        {spec.attribute}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {dimensionNames.length > 0 && (
              <div className="flex flex-col gap-3 pt-1">
                {dimensionNames.map((name) => (
                  <div key={name}>
                    <span className="block text-[13px] font-bold text-slate-700 font-heading mb-2">{name}</span>
                    <div className="flex flex-wrap gap-2">
                      {optionsByDimension.get(name).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelections((prev) => ({ ...prev, [name]: value }))}
                          className={`rounded-xl border text-[13px] font-semibold font-heading px-4 py-2 transition-all cursor-pointer ${
                            selections[name] === value
                              ? 'border-[#0c4a6e] bg-[#0c4a6e] text-white shadow-sm'
                              : 'border-slate-200/90 bg-white text-slate-700 hover:border-[#0c4a6e] hover:text-[#0c4a6e]'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!matchedVariant && (
                  <span className="text-[13px] font-medium text-amber-700">
                    Please select {dimensionNames.join(' and ')} to see price and availability.
                  </span>
                )}
              </div>
            )}

            {inStock && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-[14px] font-bold text-slate-800 font-heading">Quantity</span>
                <div className="flex items-center gap-3 bg-slate-100/80 rounded-xl px-3 py-1.5 border border-slate-200/80">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-slate-600 hover:text-[#0c4a6e] transition-colors cursor-pointer">
                    <MinusCircleIcon size={20} />
                  </button>
                  <span className="text-[14px] font-bold text-slate-800 w-6 text-center">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => Math.min(displayStock, q + 1))}
                    className="text-slate-600 hover:text-[#0c4a6e] transition-colors cursor-pointer"
                  >
                    <PlusCircleIcon size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-slate-200/80">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`rounded-xl text-[14px] font-bold font-heading tracking-wide px-8 py-3.5 transition-all shadow-sm ${
                  inStock
                    ? 'bg-[#0c4a6e] text-white hover:bg-[#075985] cursor-pointer hover:scale-105 active:scale-95 shadow-cyan-900/10'
                    : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
              >
                Add To Cart
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className={`rounded-xl text-[14px] font-bold font-heading tracking-wide px-8 py-3.5 border-2 transition-all shadow-sm ${
                  inStock
                    ? 'border-[#0c4a6e] text-[#0c4a6e] hover:bg-[#0c4a6e] hover:text-white cursor-pointer hover:scale-105 active:scale-95'
                    : 'border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Buy It Now
              </button>

              <button
                type="button"
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={handleWishlistClick}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0 ${
                  wishlisted
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : 'bg-white text-rose-500 border border-slate-200/90 hover:border-rose-400 hover:bg-rose-50/50'
                }`}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <HeartIcon size={22} filled={wishlisted} />
              </button>

              {product.dataset && (
                <a
                  href={`${BASE_URL}${ENDPOINTS.PRODUCTS.DATASET(product.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white text-slate-700 font-heading hover:text-[#0c4a6e] hover:border-[#0c4a6e] text-[14px] font-bold px-6 py-3.5 shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
                  title="View Datasheet"
                >
                  <FileTextIcon size={18} />
                  <span>Datasheet</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {displayDescription && (
          <div className="mt-10 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0c4a6e] font-heading tracking-tight mb-3">Description</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed font-normal">{displayDescription}</p>
          </div>
        )}

        {(product.content_image || contentVideoId) && (
          <div className="mt-10 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-wrap justify-center items-start gap-8">
            {product.content_image && (
              <div className="flex flex-col items-center text-center max-w-[500px]">
                <img
                  src={resolveImageUrl(product.content_image)}
                  alt={product.content_image_caption || product.name}
                  className="max-w-full max-h-[400px] rounded-xl border border-slate-200 object-contain shadow-sm"
                />
                {product.content_image_caption && (
                  <p className="mt-3 text-[14px] text-slate-600 leading-relaxed max-w-[500px]">{product.content_image_caption}</p>
                )}
              </div>
            )}

            {contentVideoId && (
              <div className="flex flex-col items-center text-center max-w-[500px] w-full sm:w-auto">
                <a
                  href={getYoutubeWatchUrl(contentVideoId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch ${product.content_video_title || product.name} on YouTube`}
                  className="group relative block w-full sm:w-[400px] aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black shadow-sm"
                >
                  <img
                    src={getYoutubeThumbnail(contentVideoId)}
                    alt={product.content_video_title || product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/10 to-transparent" />
                  {product.content_video_title && (
                    <span className="absolute top-0 left-0 right-0 px-3 py-2.5 text-left text-[14px] font-semibold font-heading text-white line-clamp-2">
                      {product.content_video_title}
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600/90 group-hover:bg-red-600 transition-colors shadow-md">
                      <PlayIcon size={24} className="text-white ml-0.5" />
                    </span>
                  </span>
                </a>
                {product.content_video_caption && (
                  <p className="mt-3 text-[14px] text-slate-600 leading-relaxed max-w-[500px]">{product.content_video_caption}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0c4a6e] font-heading tracking-tight mb-4">Customer Reviews</h2>

          {reviews.length === 0 ? (
            <p className="text-[14px] text-slate-500 mb-6">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4 mb-6">
              {reviews.map((r) => (
                <div key={r.id} className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-bold text-slate-800 font-heading">{r.author_name}</span>
                    <span className="text-[12px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={r.rating} size={13} />
                  {r.comment && <p className="text-[14px] text-slate-600 leading-relaxed mt-2">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {reviewPage < reviewTotalPages && (
            <button
              type="button"
              onClick={handleLoadMoreReviews}
              disabled={loadingMoreReviews}
              className="mb-6 text-[13px] font-bold text-[#0c4a6e] hover:underline disabled:opacity-60 cursor-pointer font-heading"
            >
              {loadingMoreReviews ? 'Loading...' : 'Load More Reviews'}
            </button>
          )}

          {user ? (
            reviewSubmitted ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3.5">
                <p className="text-[14px] font-bold text-emerald-800 font-heading">Thank you for your review!</p>
                <p className="text-[13px] text-emerald-700 mt-1">It will appear on this page once approved by our team.</p>
              </div>
            ) : reviewEligibility?.alreadyReviewed ? (
              <p className="text-[14px] text-slate-600">You've already reviewed this product.</p>
            ) : reviewEligibility && !reviewEligibility.purchased ? (
              <p className="text-[14px] text-slate-600">You can write a review after purchasing this product.</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3.5 border border-slate-200/80 bg-slate-50/40 rounded-xl p-5">
                <span className="text-[15px] font-bold text-slate-800 font-heading">Write a Review</span>
                {reviewError && <div className="text-[13px] font-semibold text-rose-600">{reviewError}</div>}
                <StarPicker value={reviewForm.rating} onChange={(rating) => setReviewForm((prev) => ({ ...prev, rating }))} />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  placeholder="Share your experience with this product (optional)"
                  className="w-full rounded-xl border border-slate-300 text-[14px] px-4 py-3 outline-none focus:border-[#0c4a6e] resize-none bg-white text-slate-800"
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="self-start rounded-xl bg-[#0c4a6e] hover:bg-[#075985] text-white text-[14px] font-bold font-heading px-6 py-2.5 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )
          ) : (
            <p className="text-[14px] text-slate-600">
              <Link to="/signin" state={{ from: window.location.pathname }} className="text-[#0c4a6e] font-semibold hover:underline">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#0c4a6e] font-heading tracking-tight mb-5">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}