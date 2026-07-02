import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { MinusIcon, PlusIcon, TrashIcon, CartIcon } from '../components/icons'
import { useCurrency } from '../context/CurrencyContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function QuantityStepper({ qty, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center border border-[#dedede] rounded-full lg:mx-5">
      <button type="button" aria-label="Decrease quantity" onClick={onDecrease} className="px-2 py-1 hover:text-[#212121]">
        <MinusIcon size={16} />
      </button>
      <input
        type="number"
        min="1"
        value={qty}
        readOnly
        className="quantity-number flex-1 w-8 text-center outline-none"
      />
      <button type="button" aria-label="Increase quantity" onClick={onIncrease} className="px-2 py-1 hover:text-[#212121]">
        <PlusIcon size={16} />
      </button>
    </div>
  )
}

export default function Cart() {
  const { format } = useCurrency()
  const { items, updateQty, removeFromCart, subTotal } = useCart()
  const { user } = useAuth()

  const totalProducts = items.length
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Header />
      <CategoryMenu />

      <div className="w-full max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 py-5">
        <section className="flex flex-col items-start mb-4">
          <h1 className="text-[24px] font-medium text-[#353535]">Shopping Cart</h1>
          <div className="flex items-center gap-2 my-[10px] text-[14px]">
            <span className="opacity-70">
              <Link to="/">Home</Link>
            </span>
            <span className="opacity-70">/</span>
            <span className="opacity-70">
              <Link to={user ? '/account' : '/signin'}>Account</Link>
            </span>
            <span className="opacity-70">/</span>
            <span>Cart</span>
          </div>
        </section>

        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10">
            <CartIcon size={80} className="text-[#9ca3af] mb-4" />
            <span className="text-[16px] text-[#212121] mb-4">Your shopping cart is empty.</span>
            <Link
              to="/"
              className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-8 py-3 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 pb-10 items-start w-full">
            <div className="cart-table-card lg:col-span-8 col-span-12 bg-white border border-[#dedede] rounded-[10px] p-[25px]">
              <div className="grid gap-3 overflow-hidden">
                <div className="hidden lg:grid grid-cols-12 w-full pb-4 mb-2 border-b border-[#dedede] text-[14px] text-[#212121]">
                  <div className="col-span-7">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-end pe-10">Price</div>
                  <div className="col-span-1" />
                </div>

                {items.map((item) => (
                  <div key={item.id}>
                    {/* desktop row */}
                    <div className="pb-3 border-b border-[#dedede] lg:flex flex-col hidden">
                      <div className="grid grid-cols-12 w-full">
                        <div className="lg:col-span-7 col-span-12 flex items-center">
                          <div className="w-[70px] h-[70px] aspect-square object-cover rounded-lg overflow-hidden shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col ps-4 flex-1">
                            <Link to={item.slug ? `/product/${item.slug}` : '/products'} className="text-[14px] text-[#212121] hover:text-cz-primary">
                              {item.title.length > 50 ? `${item.title.slice(0, 50)}...` : item.title}
                            </Link>
                          </div>
                        </div>
                        <div className="lg:col-span-2 col-span-5 flex items-center justify-center">
                          <QuantityStepper
                            qty={item.qty}
                            onDecrease={() => updateQty(item.id, -1)}
                            onIncrease={() => updateQty(item.id, 1)}
                          />
                        </div>
                        <div className="lg:col-span-2 col-span-6 flex items-center justify-end">
                          <span className="text-[14px] text-[#212121]">{format(item.price)}</span>
                        </div>
                        <div className="col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            aria-label="Remove item"
                            onClick={() => removeFromCart(item.id)}
                            className="px-3 text-gray-500 hover:text-red-500"
                          >
                            <TrashIcon size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* mobile row */}
                    <div className="pb-3 border-b border-[#dedede] lg:hidden flex flex-col">
                      <div className="w-full gap-3 items-start grid grid-cols-4">
                        <div className="overflow-hidden rounded-md bg-gray-200">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="col-span-3">
                          <div className="flex flex-col gap-1">
                            <Link to={item.slug ? `/product/${item.slug}` : '/products'} className="font-semibold text-[14px] text-[#212121] line-clamp-2">
                              {item.title}
                            </Link>
                            <span className="text-[14px] text-[#212121]">{format(item.price)}</span>
                          </div>
                          <div className="flex justify-between items-center gap-3 mt-3">
                            <QuantityStepper
                              qty={item.qty}
                              onDecrease={() => updateQty(item.id, -1)}
                              onIncrease={() => updateQty(item.id, 1)}
                            />
                            <button
                              type="button"
                              aria-label="Remove item"
                              onClick={() => removeFromCart(item.id)}
                              className="px-3 text-gray-500 hover:text-red-500"
                            >
                              <TrashIcon size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-card lg:col-span-4 col-span-12 sticky top-0 bg-white border border-[#dedede] rounded-[10px] p-5 text-[14px] text-[#212121]">
              <div className="flex justify-between pb-2">
                <span>Total Products</span>
                <span>{totalProducts}</span>
              </div>
              <div className="flex justify-between pb-4">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between items-center pb-4">
                <span className="font-semibold">SubTotal</span>
                <div className="font-semibold">{format(subTotal)}</div>
              </div>
              <Link
                to={user ? '/checkout' : '/signin'}
                state={!user ? { from: '/checkout' } : undefined}
                className="w-full flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium py-3 transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
