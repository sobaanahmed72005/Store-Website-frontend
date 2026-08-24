import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useCurrencyStore, parsePkr } from '../../store/currencyStore'
import { triggerFlyToCart } from '../cart/FlyingCartAnimation'
import { StarRating } from '../ProductCard'
import Product3DCanvas from '../3d/Product3DCanvas'
import { has3DModel } from '../../utils/has3DModel'

export default function QuickViewModal({ product, onClose }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [show3D, setShow3D] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useCartStore((s) => s.addToCart)
  const { format } = useCurrencyStore()

  if (!product) return null

  const canShow3D = has3DModel(product)
  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))]
  const activeImage = images[activeImgIndex] || product.image
  const pkrPrice = parsePkr(product.price)
  const stock = product.stock != null ? product.stock > 0 : product.inStock !== false
  const productHref = product.slug ? `/product/${product.slug}` : product.href || '/shop'

  const handleAddToCart = (e) => {
    if (isAdding || !stock) return
    setIsAdding(true)

    const rect = e.currentTarget.getBoundingClientRect()
    triggerFlyToCart(rect, activeImage)

    addToCart({
      id: product.id || product.title,
      title: product.title,
      image: product.image,
      price: pkrPrice,
      slug: product.slug,
    })

    setTimeout(() => {
      setIsAdding(false)
      onClose()
    }, 450)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col md:flex-row animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
        >
          ✕
        </button>

        {/* Left Section: Photo / 3D Canvas Switcher */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 bg-slate-50 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-slate-100">
          {canShow3D && (
            <div className="flex items-center gap-2 self-start mb-1">
              <button
                type="button"
                onClick={() => setShow3D(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  !show3D ? 'bg-cyan-500 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                🖼 Photo View
              </button>
              <button
                type="button"
                onClick={() => setShow3D(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  show3D ? 'bg-cyan-500 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                🧊 Interactive 3D Model
              </button>
            </div>
          )}

          {!show3D || !canShow3D ? (
            <>
              <div className="relative w-full aspect-square max-h-[280px] sm:max-h-[340px] md:max-h-none bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center p-3">
                <img src={activeImage} alt={product.title} className="w-full h-full object-contain" />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                  {images.map((img, i) => (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setActiveImgIndex(i)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        i === activeImgIndex ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Product3DCanvas product={product} title={product.title} className="w-full aspect-square max-h-[280px] sm:max-h-[340px] md:max-h-none bg-white rounded-xl" />
          )}
        </div>

        {/* Right Details Section */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wider">
                Quick Preview
              </span>
              {stock ? (
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 sm:py-1 rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 sm:py-1 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{product.title}</h2>

            <StarRating rating={product.rating || 5} />

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{format(pkrPrice)}</span>
              {product.oldPrice && (
                <span className="text-xs sm:text-sm text-slate-400 line-through">{format(product.oldPrice)}</span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
              {product.description || 'High-performance hardware component optimized for speed, stability, and sleek aesthetics.'}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={!stock || isAdding}
              onClick={handleAddToCart}
              className={`w-full py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                stock
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isAdding ? 'Adding to Cart...' : 'Add To Cart'}
            </button>

            <Link
              to={productHref}
              onClick={onClose}
              className="text-center text-xs font-semibold text-slate-600 hover:text-cyan-600 py-1 transition-colors"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
