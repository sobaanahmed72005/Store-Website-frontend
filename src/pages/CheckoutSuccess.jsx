import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Logo from '../components/Logo'

export default function CheckoutSuccess() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-white border-b border-[#dedede]">
        <div className="max-w-[1280px] mx-auto px-5 py-5">
          <Link to="/">
            <Logo textClassName="text-[22px]" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="text-center max-w-[480px]">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-[24px] font-semibold text-[#212121] mb-2">Payment Successful</h1>
          {orderId && (
            <p className="text-[15px] text-[#4b4b4b] mb-2">
              Order <strong>#{orderId}</strong> has been placed.
            </p>
          )}
          <p className="text-[14px] text-[#4b4b4b] mb-8">
            Your payment was confirmed via Safepay. We'll prepare your order and send you shipping updates by email.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/account"
              className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-3 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="rounded-full border border-[#d1d5db] text-[14px] font-medium px-6 py-3 hover:bg-cz-gold-light transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}