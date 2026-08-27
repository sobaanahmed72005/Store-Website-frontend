import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import SearchBar from './SearchBar'
import Navbar from './Navbar'
import { useNavItems } from '../hooks/useNavItems'
import { useCategories } from '../store/categoryStore'
import { categorySlugToPath } from '../utils/categoryPath'
import { useWishlist } from '../store/wishlistStore'
import { useCart } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useCurrency } from '../store/currencyStore'
import {
  AccountIcon,
  HeartIcon,
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  HamburgerIcon,
  SearchIcon,
} from './icons'


function NavDrawer({ open, onClose }) {
  const categoryItems = useNavItems()
  const { navCategories } = useCategories()
  const [expandedItem, setExpandedItem] = useState(null)

  const toggleExpand = (label, e) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedItem((prev) => (prev === label ? null : label))
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex justify-start items-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        role="complementary"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col relative h-full w-full max-w-[22rem] shadow-2xl bg-white text-[#374151] transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-[#0b658a] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Logo iconOnly variant="light" size={34} textScale={0.3} />
            <span className="font-bold text-lg text-white tracking-wide">Navigation</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Categories & Subcategories Navigation Tree */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-slate-100">
          <div className="pb-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</h3>
            <ul className="flex flex-col gap-1">
              {categoryItems.map((item) => {
                let subLinks = []
                if (item.label === 'Products') {
                  subLinks = [...navCategories]
                    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
                    .map((cat) => ({ label: cat.name, to: categorySlugToPath(cat.slug) }))
                } else if (item.subcategories) {
                  subLinks = item.subcategories.map((sub) => ({ label: sub.name, to: categorySlugToPath(sub.slug) }))
                }

                const isExpanded = expandedItem === item.label

                return (
                  <li key={item.label} className="py-1">
                    <div className="flex items-center justify-between rounded-lg hover:bg-sky-50 px-2 py-1.5 transition-colors">
                      {item.to ? (
                        <Link
                          to={item.to}
                          onClick={onClose}
                          className="text-[14px] font-semibold text-slate-800 hover:text-cz-primary transition-colors flex-1"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          onClick={(e) => item.hasDropdown && toggleExpand(item.label, e)}
                          className="text-[14px] font-semibold text-slate-800 flex-1 cursor-pointer"
                        >
                          {item.label}
                        </span>
                      )}

                      {item.hasDropdown && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpand(item.label, e)}
                          aria-label={`Toggle ${item.label} subcategories`}
                          className="p-1 text-slate-400 hover:text-cz-primary transition-colors"
                        >
                          <ChevronDownIcon
                            size={16}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-cz-sky' : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {item.hasDropdown && isExpanded && subLinks.length > 0 && (
                      <div className="flex flex-col gap-1 pl-4 pt-1.5 pb-2 border-l-2 border-cz-primary/40 my-1 ml-2 bg-slate-50/80 rounded-r-lg">
                        {subLinks.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            onClick={onClose}
                            className="text-[13px] font-medium text-slate-600 hover:text-cz-primary py-1 px-2.5 rounded hover:bg-sky-100/60 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Quick Pages & Account Links */}
          <div className="pt-4 pb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Store Info</h3>
            <div className="flex flex-col gap-1.5">
              <Link
                to="/about-us"
                onClick={onClose}
                className="text-[13px] font-medium text-slate-700 hover:text-cz-primary py-1.5 px-2 rounded hover:bg-slate-50 flex items-center justify-between"
              >
                <span>About Us</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                to="/contact"
                onClick={onClose}
                className="text-[13px] font-medium text-slate-700 hover:text-cz-primary py-1.5 px-2 rounded hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Contact Us</span>
                <span className="text-slate-400">→</span>
              </Link>
              <Link
                to="/return-exchange"
                onClick={onClose}
                className="text-[13px] font-medium text-slate-700 hover:text-cz-primary py-1.5 px-2 rounded hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Policies</span>
                <span className="text-slate-400">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function CartDrawer({ open, onClose, items, onUpdateQty, onRemove }) {
  const { format } = useCurrency()
  const user = useAuthStore((s) => s.user)
  const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex justify-end items-center bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        role="complementary"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col relative h-full w-full max-w-[28rem] shadow-2xl bg-white text-[#374151] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#dedede] flex items-center justify-between shrink-0 bg-white">
          <div className="font-semibold text-xl text-[#212121]">Shopping Cart</div>
          <button type="button" aria-label="Close" onClick={onClose} className="focus:outline-none cursor-pointer">
            <CloseIcon size={20} className="text-[#64748b]" />
          </button>
        </div>

        <div className="px-6 py-6 h-full w-full grow overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center h-full justify-center">
              <CartIcon size={80} className="text-[#64748b] mb-4" />
              <span className="w-full text-center my-4 text-[#212121]">Your shopping cart is empty.</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 w-2/3 flex justify-center items-center transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-products flex flex-col gap-4 pb-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variantId ?? ''}`} className="relative flex items-center justify-between gap-3 p-2 rounded-xl border border-slate-100 hover:border-slate-200">
                  <div className="relative flex items-center justify-center w-[60px] h-[60px] rounded-md overflow-hidden shrink-0 bg-slate-50">
                    <span className="absolute -left-[2px] -top-[2px] z-[1] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-cz-primary text-white text-[11px] font-bold">
                      {item.qty}
                    </span>
                    <img src={item.image} alt={item.title} width={60} height={60} className="h-full w-auto object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] text-[#212121] line-clamp-2">{item.title}</div>
                    {item.variantLabel && <div className="text-[12px] text-[#6b7280] mt-0.5">{item.variantLabel}</div>}
                    <div className="flex items-center mt-2">
                      <div className="flex items-center border border-[#dedede] rounded-full bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => onUpdateQty(item.id, item.variantId, -1)}
                          className="px-2 py-1 text-[#212121] cursor-pointer"
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="px-2 text-[13px] font-bold">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => onUpdateQty(item.id, item.variantId, 1)}
                          className="px-2 py-1 text-[#212121] cursor-pointer"
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <span className="font-bold pl-3 text-[14px] text-cz-primary">{format(item.price * item.qty)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => onRemove(item.id, item.variantId)}
                    className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer p-1"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-button-area shrink-0 p-5 bg-white border-t border-[#dedede] shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[16px] text-[#212121]">SubTotal</span>
              <span className="text-[18px] font-black text-cz-primary">{format(subTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="flex-1 flex justify-center items-center rounded-full border-2 border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[14px] font-bold py-2.5 transition-colors"
              >
                View Cart
              </Link>
              <Link
                to={user ? '/checkout' : '/signin'}
                state={!user ? { from: '/checkout' } : undefined}
                onClick={onClose}
                className="flex-1 flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-bold py-2.5 transition-colors shadow-md"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function WishlistDrawer({ open, onClose, items, onRemove, onMoveToCart }) {
  const { format } = useCurrency()

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex justify-end items-center bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        role="complementary"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col relative h-full w-full max-w-[28rem] shadow-2xl bg-white text-[#374151] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#dedede] flex items-center justify-between shrink-0 bg-white">
          <div className="font-semibold text-xl text-[#212121]">Wishlist</div>
          <button type="button" aria-label="Close" onClick={onClose} className="focus:outline-none cursor-pointer">
            <CloseIcon size={20} className="text-[#64748b]" />
          </button>
        </div>

        <div className="px-6 py-6 h-full w-full grow overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center h-full justify-center">
              <HeartIcon size={80} className="text-[#64748b] mb-4" />
              <span className="w-full text-center my-4 text-[#212121]">Your wishlist is empty.</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 w-2/3 flex justify-center items-center transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="wishlist-products flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between gap-3 p-2 rounded-xl border border-slate-100 hover:border-slate-200">
                  <div className="relative flex items-center justify-center w-[60px] h-[60px] rounded-md overflow-hidden shrink-0 bg-slate-50">
                    <img src={item.image} alt={item.title} width={60} height={60} className="h-full w-auto object-contain" />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={item.slug ? `/product/${item.slug}` : '/shop'}
                      onClick={onClose}
                      className="font-semibold text-[14px] text-[#212121] line-clamp-2 hover:text-cz-primary"
                    >
                      {item.title}
                    </Link>
                    {item.price != null && (
                      <span className="block font-bold text-[14px] text-cz-primary mt-1">{format(item.price)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onMoveToCart(item)}
                      disabled={item.stock != null && item.stock <= 0}
                      className="mt-2 text-[12px] font-bold text-cz-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
                    >
                      {item.stock != null && item.stock <= 0 ? 'Out of stock' : 'Move to Cart'}
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from wishlist"
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0 cursor-pointer p-1"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function CurrencySwitcher({ size = 20, showLabel = true }) {
  const { currency, setCurrency, currencies } = useCurrency()
  const [open, setOpen] = useState(false)

  if (Object.keys(currencies).length <= 1) return null

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Select currency"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-white cursor-pointer"
      >
        <span style={{ fontSize: size * 0.8 }}>{currencies[currency]?.flag}</span>
        {showLabel && <span>{currency}</span>}
        <ChevronDownIcon size={14} className={open ? 'rotate-180' : ''} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[1100]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[1101] min-w-[120px] rounded-md bg-white shadow-[0_0_15px_1px_rgba(0,0,0,0.178)] overflow-hidden">
            {Object.keys(currencies).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setCurrency(code)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-[13px] text-left hover:bg-cz-gold-light ${
                  code === currency ? 'font-semibold text-cz-primary' : 'text-[#353535]'
                }`}
              >
                <span>{currencies[code].flag}</span>
                <span>{code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Header() {
  const { items: wishlistItems, count: wishlistCount, removeFromWishlist, wishlistOpen, openWishlist, closeWishlist } = useWishlist()
  const { items: cartItems, count: cartCount, updateQty, removeFromCart, addToCart, cartOpen, openCart, closeCart } = useCart()
  const user = useAuthStore((s) => s.user)
  const [navOpen, setNavOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-[100] shadow-md">
      <Navbar />
      <div className="bg-cz-header text-[var(--cz-header-text)] py-2.5 border-b border-cyan-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop & Tablet Header Layout */}
        <div className="hidden md:flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setNavOpen(true)}
              className="text-white hover:text-cz-sky transition p-1.5 rounded-lg hover:bg-white/10 flex items-center cursor-pointer"
            >
              <HamburgerIcon size={26} />
            </button>
            <Link to="/" className="flex items-center gap-3 py-2">
              <Logo iconOnly variant="light" size={52} textScale={0.35} />
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center justify-end gap-4 shrink-0">
            <Link
              to={user ? '/account' : '/signin'}
              aria-label="Account"
              className="flex items-center text-[var(--cz-header-text)] cursor-pointer hover:opacity-80 transition"
            >
              <AccountIcon size={26} />
              <span className="sr-only">Account</span>
            </Link>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={openWishlist}
              className="relative flex items-center text-[var(--cz-header-text)] cursor-pointer hover:opacity-80 transition"
            >
              <HeartIcon size={26} />
              <span className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-cz-primary text-white text-[11px] font-bold leading-none">
                {wishlistCount}
              </span>
            </button>

            <button
              type="button"
              id="header-cart-icon"
              aria-label="Cart"
              onClick={openCart}
              className="header-cart-target relative flex items-center text-[var(--cz-header-text)] cursor-pointer hover:opacity-80 transition"
            >
              <CartIcon size={26} />
              <span className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-cz-primary text-white text-[11px] font-bold leading-none">
                {cartCount}
              </span>
            </button>

            <CurrencySwitcher />
          </div>
        </div>

        {/* Mobile / Tablet Header Layout */}
        <div className="flex md:hidden items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" aria-label="Menu" onClick={() => setNavOpen(true)} className="text-[var(--cz-header-text)] p-1 shrink-0">
              <HamburgerIcon size={24} />
            </button>
            <Link to="/" className="flex items-center shrink-0">
              <Logo iconOnly variant="light" size={40} textScale={0.32} />
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="text-[var(--cz-header-text)] p-1"
            >
              <SearchIcon size={24} />
            </button>

            <Link to={user ? '/account' : '/signin'} aria-label="Account" className="flex items-center text-[var(--cz-header-text)] p-1">
              <AccountIcon size={24} />
              <span className="sr-only">Account</span>
            </Link>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={openWishlist}
              className="relative flex items-center text-[var(--cz-header-text)] p-1"
            >
              <HeartIcon size={24} />
              <span className="absolute -top-[3px] -right-[3px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-cz-primary text-white text-[10px] font-bold leading-none">
                {wishlistCount}
              </span>
            </button>

            <button
              type="button"
              id="header-cart-icon-mobile"
              aria-label="Cart"
              onClick={openCart}
              className="header-cart-target relative flex items-center text-[var(--cz-header-text)] p-1"
            >
              <CartIcon size={24} />
              <span className="absolute -top-[3px] -right-[3px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-cz-primary text-white text-[10px] font-bold leading-none">
                {cartCount}
              </span>
            </button>

            <CurrencySwitcher size={16} showLabel={false} />
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden pt-2 pb-1">
            <SearchBar />
          </div>
        )}
      </div>
    </div>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={closeWishlist}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onMoveToCart={(item) => {
          addToCart({ id: item.id, slug: item.slug, title: item.title, image: item.image, price: item.price }, 1)
          removeFromWishlist(item.id)
        }}
      />
    </header>
  )
}
