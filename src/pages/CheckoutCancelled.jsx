import { Link, useSearchParams } from 'react-router-dom'
import Logo from '../components/Logo'

export default function CheckoutCancelled() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')

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
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h1 className="text-[24px] font-semibold text-[#212121] mb-2">Payment Cancelled</h1>
          {orderId && (
            <p className="text-[15px] text-[#4b4b4b] mb-2">
              Order <strong>#{orderId}</strong> was not completed.
            </p>
          )}
          <p className="text-[14px] text-[#4b4b4b] mb-8">
            Your payment was cancelled. Your cart is still saved — you can go back and try again, or choose a different payment method.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/checkout"
              className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-3 transition-colors"
            >
              Try Again
            </Link>
            <Link
              to="/cart"
              className="rounded-full border border-[#d1d5db] text-[14px] font-medium px-6 py-3 hover:bg-cz-gold-light transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}