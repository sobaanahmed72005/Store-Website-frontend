import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import SearchBar from './SearchBar'
import { useNavItems } from './CategoryMenu'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
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
  return (
    <div
      className={`fixed inset-0 z-[1101] flex justify-start items-center bg-[#6b7280]/70 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        role="complementary"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col relative h-full w-full max-w-[20rem] shadow-xl bg-white text-[#374151] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#dedede] flex items-center justify-between">
          <div className="font-semibold text-xl text-[#212121]">Menu</div>
          <button type="button" aria-label="Close" onClick={onClose} className="focus:outline-none">
            <CloseIcon size={20} className="text-[#64748b]" />
          </button>
        </div>

        <ul className="flex flex-col px-6 py-4 gap-4 overflow-y-auto">
          {categoryItems.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center justify-between text-[14px] text-[#212121]"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDownIcon size={14} className="-rotate-90" />}
                </Link>
              ) : (
                <span className="flex items-center justify-between text-[14px] text-[#212121]">
                  {item.label}
                  {item.hasDropdown && <ChevronDownIcon size={14} className="-rotate-90" />}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CartDrawer({ open, onClose, items, onUpdateQty, onRemove }) {
  const { format } = useCurrency()
  const { user } = useAuth()
  const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div
      className={`fixed inset-0 z-[1101] flex justify-end items-center bg-[#6b7280]/70 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        role="complementary"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col relative h-full w-full max-w-[28rem] shadow-xl bg-white text-[#374151] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#dedede] flex items-center justify-between">
          <div className="font-semibold text-xl text-[#212121]">Shopping Cart</div>
          <button type="button" aria-label="Close" onClick={onClose} className="focus:outline-none">
            <CloseIcon size={20} className="text-[#64748b]" />
          </button>
        </div>

        <div className="px-6 pb-6 mt-6 h-full w-full grow overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center h-full justify-center">
              <CartIcon size={80} className="text-[#64748b] mb-4" />
              <span className="w-full text-center my-4 text-[#212121]">Your shopping cart is empty.</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 w-2/3 flex justify-center items-center transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-products flex flex-col gap-4 pb-[113px]">
              {items.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between gap-3">
                  <div className="relative flex items-center justify-center w-[60px] h-[60px] rounded-md overflow-hidden shrink-0">
                    <span className="absolute -left-[5px] -top-[5px] z-[1] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-cz-primary text-white text-[11px]">
                      {item.qty}
                    </span>
                    <img src={item.image} alt={item.title} className="h-full w-auto" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] text-[#212121] line-clamp-2">{item.title}</div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center border border-[#dedede] rounded-full">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="px-2 py-1 text-[#212121]"
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="px-2 text-[13px]">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="px-2 py-1 text-[#212121]"
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <span className="font-medium pl-2 text-[14px] text-[#212121]">{format(item.price)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-button-area absolute bottom-0 left-0 w-full min-h-[100px] flex flex-col justify-end p-5 bg-gradient-to-t from-white via-white to-transparent">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-[#212121]">SubTotal</span>
              <span className="text-[16px] font-bold text-[#212121]">{format(subTotal)}</span>
            </div>
            <div className="flex gap-2">
              <Link
                to="/cart"
                onClick={onClose}
                className="flex-1 flex justify-center items-center rounded-full border-2 border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[14px] font-medium py-2.5 transition-colors"
              >
                View Cart
              </Link>
              <Link
                to={user ? '/checkout' : '/signin'}
                state={!user ? { from: '/checkout' } : undefined}
                onClick={onClose}
                className="flex-1 flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium py-2.5 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WishlistDrawer({ open, onClose, items, onRemove, onMoveToCart }) {
  const { format } = useCurrency()
  return (
    <div
      className={`fixed inset-0 z-[1101] flex justify-end items-center bg-[#6b7280]/70 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        role="complementary"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col relative h-full w-full max-w-[28rem] shadow-xl bg-white text-[#374151] transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#dedede] flex items-center justify-between">
          <div className="font-semibold text-xl text-[#212121]">Wishlist</div>
          <button type="button" aria-label="Close" onClick={onClose} className="focus:outline-none">
            <CloseIcon size={20} className="text-[#64748b]" />
          </button>
        </div>

        <div className="px-6 pb-6 mt-6 h-full w-full grow overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center h-full justify-center">
              <HeartIcon size={80} className="text-[#64748b] mb-4" />
              <span className="w-full text-center my-4 text-[#212121]">Your wishlist is empty.</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 w-2/3 flex justify-center items-center transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between gap-3">
                  <div className="relative flex items-center justify-center w-[60px] h-[60px] rounded-md overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="h-full w-auto" />
                  </div>
                  <div className="flex-1">
                    <Link
                      to={item.slug ? `/product/${item.slug}` : '/products'}
                      onClick={onClose}
                      className="font-semibold text-[14px] text-[#212121] line-clamp-2 hover:text-cz-primary"
                    >
                      {item.title}
                    </Link>
                    {item.price != null && (
                      <span className="block font-medium text-[14px] text-[#212121] mt-2">{format(item.price)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onMoveToCart(item)}
                      disabled={item.stock != null && item.stock <= 0}
                      className="mt-2 text-[12px] font-medium text-cz-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {item.stock != null && item.stock <= 0 ? 'Out of stock' : 'Move to Cart'}
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from wishlist"
                    onClick={() => onRemove(item.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
  const { items: wishlistItems, count: wishlistCount, removeFromWishlist } = useWishlist()
  const { items: cartItems, count: cartCount, updateQty, removeFromCart, addToCart, cartOpen, openCart, closeCart } = useCart()
  const { user } = useAuth()
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <div className="bg-cz-header py-2.5">
      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5">
        <div className="hidden md:grid grid-cols-4 items-center gap-4">
          <Link to="/" className="flex items-center justify-start col-span-1">
            <Logo variant="light" textClassName="text-[26px]" />
          </Link>

          <div className="block col-span-2 px-6">
            <SearchBar />
          </div>

          <div className="flex items-center justify-end gap-[15px]">
            <Link
              to={user ? '/account' : '/signin'}
              aria-label="Account"
              className="flex items-center text-white cursor-pointer"
            >
              <AccountIcon size={28} />
            </Link>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => setWishlistOpen(true)}
              className="relative flex items-center text-white cursor-pointer"
            >
              <HeartIcon size={28} />
              <span className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-cz-accent text-cz-ink text-[11px] font-medium leading-none">
                {wishlistCount}
              </span>
            </button>

            <button
              type="button"
              aria-label="Cart"
              onClick={openCart}
              className="relative flex items-center text-white cursor-pointer"
            >
              <CartIcon size={28} />
              <span className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-cz-accent text-cz-ink text-[11px] font-medium leading-none">
                {cartCount}
              </span>
            </button>

            <CurrencySwitcher />
          </div>
        </div>

        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Menu" onClick={() => setNavOpen(true)} className="text-white">
              <HamburgerIcon size={28} />
            </button>
            <Link to="/" className="flex items-center">
              <Logo variant="light" textClassName="text-[22px]" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="text-white"
            >
              <SearchIcon size={28} />
            </button>

            <Link to={user ? '/account' : '/signin'} aria-label="Account" className="flex items-center text-white">
              <AccountIcon size={28} />
            </Link>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => setWishlistOpen(true)}
              className="relative flex items-center text-white"
            >
              <HeartIcon size={28} />
              <span className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-cz-accent text-cz-ink text-[11px] font-medium leading-none">
                {wishlistCount}
              </span>
            </button>

            <button
              type="button"
              aria-label="Cart"
              onClick={openCart}
              className="relative flex items-center text-white"
            >
              <CartIcon size={28} />
              <span className="absolute -top-[5px] -right-[5px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-cz-accent text-cz-ink text-[11px] font-medium leading-none">
                {cartCount}
              </span>
            </button>

            <CurrencySwitcher size={18} showLabel={false} />
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden mt-3">
            <SearchBar />
          </div>
        )}
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
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onMoveToCart={(item) => {
          addToCart({ id: item.id, slug: item.slug, title: item.title, image: item.image, price: item.price }, 1)
          removeFromWishlist(item.id)
        }}
      />
    </div>
  )
}
