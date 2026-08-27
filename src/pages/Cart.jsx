import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { MinusIcon, PlusIcon, TrashIcon, CartIcon } from '../components/icons'
import { useCurrency } from '../store/currencyStore'
import { useCart } from '../store/cartStore'
import { useAuth } from '../store/authStore'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'
import { api, resolveImageUrl } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { getEffectivePrice } from '../utils/pricing'

function QuantityStepper({ qty, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50 lg:mx-3">
      <button type="button" aria-label="Decrease quantity" onClick={onDecrease} className="px-2.5 py-1 text-slate-600 hover:text-slate-900 transition-colors">
        <MinusIcon size={14} />
      </button>
      <input
        type="number"
        min="1"
        value={qty}
        readOnly
        className="quantity-number flex-1 w-7 text-center outline-none bg-transparent font-semibold text-[13px] text-slate-800"
      />
      <button type="button" aria-label="Increase quantity" onClick={onIncrease} className="px-2.5 py-1 text-slate-600 hover:text-slate-900 transition-colors">
        <PlusIcon size={14} />
      </button>
    </div>
  )
}

export default function Cart() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Your Shopping Cart — Review Items | ${siteName || 'IT Solutions'}`,
    canonical: `${window.location.origin}/cart`,
    noindex: true,
  })
  const { format } = useCurrency()
  const { items, addToCart, updateQty, removeFromCart, subTotal, refreshPrices } = useCart()
  const { user } = useAuth()
  const [priceNotice, setPriceNotice] = useState(null)

  // Recommendations state
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    refreshPrices().then(({ changed, removed }) => {
      if (changed.length > 0 || removed.length > 0) setPriceNotice({ changed, removed })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch top recommendations for cross-selling
  useEffect(() => {
    api
      .get(ENDPOINTS.PRODUCTS.LIST('?limit=30'))
      .then((data) => {
        if (Array.isArray(data.products)) {
          setRecommendations(data.products)
        }
      })
      .catch(() => setRecommendations([]))
  }, [])

  const totalProducts = items.length
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  // Filter recommendations to exclude products already in the cart (show top 10)
  const cartItemIds = new Set(items.map((i) => i.id))
  const filteredRecommendations = recommendations
    .filter((p) => !cartItemIds.has(p.id) && p.is_active !== 0)
    .slice(0, 10)

  const handleAddRecToCart = (product) => {
    const { price } = getEffectivePrice(product)
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        title: product.name,
        image: resolveImageUrl(product.image),
        price: Number(price),
        variantId: null,
        variantLabel: null,
      },
      1
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Ocean Navy Title Heading (No Breadcrumbs) */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            Shopping Cart
          </h1>
          <SeoHeadingFiller h3="Cart items" h4="Item details" h5="Quantity and pricing" h6="Order summary" />
        </div>

        {priceNotice && (
          <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-5 text-[13px] text-amber-800 shadow-sm">
            {priceNotice.changed.map((c) => (
              <div key={c.title}>
                The price of <strong>{c.title}</strong> changed from {format(c.from)} to {format(c.to)} — updated below.
              </div>
            ))}
            {priceNotice.removed.map((title) => (
              <div key={title}>
                <strong>{title}</strong> is no longer available and was removed from your cart.
              </div>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 px-5 bg-white border border-slate-100 rounded-xl shadow-sm mb-8">
            <CartIcon size={64} className="text-slate-300 mb-4" />
            <h3 className="text-[17px] font-bold text-slate-800 font-heading mb-1">Your Shopping Cart is Empty</h3>
            <p className="text-[13px] text-slate-500 max-w-sm mb-6 leading-relaxed">
              Looks like you haven&apos;t added any items to your cart yet. Explore our products and discover great deals!
            </p>
            <Link
              to="/shop"
              className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-7 py-3 transition-all shadow hover:shadow-md"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-5 pb-6 items-start w-full">
            {/* Cart Items List Card */}
            <div className="cart-table-card lg:col-span-8 col-span-12 bg-white border border-slate-100 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="grid gap-3 overflow-hidden">
                <div className="hidden lg:grid grid-cols-12 w-full pb-3 mb-2 border-b border-slate-100 text-[13px] font-bold text-slate-700">
                  <div className="col-span-7">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-end pe-4">Price</div>
                  <div className="col-span-1" />
                </div>

                {items.map((item) => (
                  <div key={`${item.id}-${item.variantId ?? ''}`}>
                    {/* Desktop Row */}
                    <div className="pb-3 pt-1 border-b border-slate-100 lg:flex flex-col hidden last:border-none">
                      <div className="grid grid-cols-12 w-full items-center">
                        <div className="lg:col-span-7 col-span-12 flex items-center">
                          <div className="w-[64px] h-[64px] aspect-square object-cover rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                            <img src={item.image} alt={item.title} width={64} height={64} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex flex-col ps-3.5 flex-1 min-w-0">
                            <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="text-[14px] font-semibold text-slate-800 hover:text-cz-primary transition-colors leading-snug truncate">
                              {item.title}
                            </Link>
                            {item.variantLabel && <span className="text-[12px] text-slate-400 mt-0.5">{item.variantLabel}</span>}
                          </div>
                        </div>
                        <div className="lg:col-span-2 col-span-5 flex items-center justify-center">
                          <QuantityStepper
                            qty={item.qty}
                            onDecrease={() => updateQty(item.id, item.variantId, -1)}
                            onIncrease={() => updateQty(item.id, item.variantId, 1)}
                          />
                        </div>
                        <div className="lg:col-span-2 col-span-6 flex items-center justify-end pr-4">
                          <span className="text-[14px] font-bold text-slate-800">{format(item.price)}</span>
                        </div>
                        <div className="col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            aria-label="Remove item"
                            onClick={() => removeFromCart(item.id, item.variantId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div className="pb-3.5 pt-1 border-b border-slate-100 lg:hidden flex flex-col last:border-none">
                      <div className="w-full gap-3 items-start grid grid-cols-4">
                        <div className="overflow-hidden rounded-lg border border-slate-100 bg-slate-50 aspect-square">
                          <img src={item.image} alt={item.title} width={80} height={80} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="col-span-3">
                          <div className="flex flex-col gap-1">
                            <Link to={item.slug ? `/product/${item.slug}` : '/shop'} className="font-semibold text-[14px] text-slate-800 line-clamp-2 leading-snug">
                              {item.title}
                            </Link>
                            {item.variantLabel && <span className="text-[12px] text-slate-400">{item.variantLabel}</span>}
                            <span className="text-[14px] font-bold text-cz-primary mt-0.5">{format(item.price)}</span>
                          </div>
                          <div className="flex justify-between items-center gap-3 mt-3">
                            <QuantityStepper
                              qty={item.qty}
                              onDecrease={() => updateQty(item.id, item.variantId, -1)}
                              onIncrease={() => updateQty(item.id, item.variantId, 1)}
                            />
                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() => removeFromCart(item.id, item.variantId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <TrashIcon size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="summary-card lg:col-span-4 col-span-12 sticky top-4 bg-white border border-slate-100 rounded-xl p-5 text-[14px] text-slate-700 shadow-sm">
              <h3 className="text-[16px] font-bold text-slate-800 font-heading pb-3 mb-3 border-b border-slate-100">
                Order Summary
              </h3>
              <div className="flex justify-between pb-2 text-[13px] text-slate-600">
                <span>Total Products</span>
                <span className="font-semibold text-slate-800">{totalProducts}</span>
              </div>
              <div className="flex justify-between pb-4 text-[13px] text-slate-600 border-b border-slate-100">
                <span>Total Items</span>
                <span className="font-semibold text-slate-800">{totalItems}</span>
              </div>
              <div className="flex justify-between items-center py-4 text-[15px]">
                <span className="font-bold text-slate-800 font-heading">SubTotal</span>
                <div className="font-bold text-cz-primary text-[18px]">{format(subTotal)}</div>
              </div>
              <Link
                to={user ? '/checkout' : '/signin'}
                state={!user ? { from: '/checkout' } : undefined}
                className="w-full flex justify-center items-center rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-bold tracking-wide py-3.5 transition-all shadow hover:shadow-md text-center mt-2"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}

        {/* You Might Also Like Recommendations - Touch-Swipe Carousel on Mobile & 5-Col Grid on Desktop */}
        {filteredRecommendations.length > 0 && (
          <section className="mt-8 pt-8 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0c4a6e] font-heading tracking-tight">
                  You Might Also Like
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 mt-0.5">
                  Popular trending items customers frequently add to their order
                </p>
              </div>
              <Link to="/shop" className="text-[12px] sm:text-[13px] font-semibold text-cz-primary hover:underline shrink-0">
                Explore All →
              </Link>
            </div>

            {/* Horizontal Swipe Scroll Row on Mobile, Grid on Desktop */}
            <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 sm:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {filteredRecommendations.map((p) => {
                const { price, oldPrice } = getEffectivePrice(p)

                return (
                  <div
                    key={p.id}
                    className="snap-start shrink-0 w-[170px] sm:w-auto bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <Link to={`/product/${p.slug}`} className="block relative aspect-square rounded-lg overflow-hidden bg-slate-50 mb-2.5">
                        <img
                          src={resolveImageUrl(p.image)}
                          alt={p.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <Link
                        to={`/product/${p.slug}`}
                        className="text-[12px] sm:text-[13px] font-semibold text-slate-800 hover:text-cz-primary line-clamp-2 leading-snug mb-1"
                      >
                        {p.name}
                      </Link>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-[13px] sm:text-[14px] font-bold text-cz-primary">
                          {format(Number(price))}
                        </span>
                        {oldPrice && (
                          <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                            {format(Number(oldPrice))}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRecToCart(p)}
                        className="w-full py-1.5 px-2 rounded-lg bg-cz-sky/10 hover:bg-cz-primary text-cz-primary hover:text-white text-[11px] sm:text-[12px] font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <span>+ Quick Add</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
