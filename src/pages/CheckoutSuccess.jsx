import { useEffect } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import { useCart } from '../store/cartStore'
import { useAuth } from '../store/authStore'
import Logo from '../components/Logo'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'
import { useSiteSettings } from '../store/siteSettingsStore'

const GOOGLE_MERCHANT_ID = 5858415197

export default function CheckoutSuccess() {
  const { siteName } = useSiteSettings()
  const { user } = useAuth()
  const location = useLocation()
  const locationState = location.state || {}

  useSeo({
    title: `Payment Successful — Order Confirmed | ${siteName || 'IT Solutions'}`,
    canonical: `${window.location.origin}/checkout/success`,
    noindex: true,
  })
  const [params] = useSearchParams()
  const orderId = params.get('orderId') || locationState.orderId
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Google Customer Reviews Opt-in Script Integration
  useEffect(() => {
    const currentOrderId = orderId || 'ORDER'
    const customerEmail = locationState.email || user?.email

    if (!customerEmail) return

    // Calculate estimated delivery date: 4 days from order placement (YYYY-MM-DD)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 4)
    const estDeliveryDate = deliveryDate.toISOString().split('T')[0]

    window.renderOptIn = function () {
      if (window.gapi && window.gapi.load) {
        window.gapi.load('surveyoptin', function () {
          window.gapi.surveyoptin.render({
            merchant_id: GOOGLE_MERCHANT_ID,
            order_id: String(currentOrderId),
            email: String(customerEmail),
            delivery_country: 'PK',
            estimated_delivery_date: estDeliveryDate,
          })
        })
      }
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn'
    script.async = true;
    script.defer = true;
    document.body.appendChild(script)

    return () => {
      try {
        if (script.parentNode) script.parentNode.removeChild(script)
        delete window.renderOptIn
      } catch {
        // Ignore unmount error
      }
    }
  }, [orderId, locationState.email, user?.email])

  return (
    <div className="min-h-screen bg-cz-page flex flex-col">
      <div className="bg-cz-header">
        <div className="max-w-[1280px] mx-auto px-5 py-2.5">
          <Link to="/">
            <Logo iconOnly variant="light" size={64} />
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
          <SeoHeadingFiller h2="Order confirmation" h3="Next steps" h4="Order details" h5="Continue shopping" h6="Support" />
          {orderId && (
            <p className="text-[15px] text-[#4b4b4b] mb-2">
              Order <strong>#{orderId}</strong> has been placed.
            </p>
          )}
          <p className="text-[14px] text-[#4b4b4b] mb-8">
            Your payment was confirmed. We'll prepare your order and send you shipping updates by email.
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