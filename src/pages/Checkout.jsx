import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CartIcon, ChevronDownIcon, CheckIcon } from '../components/icons'
import Logo from '../components/Logo'
import { useCurrency } from '../context/CurrencyContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-[#d1d5db] bg-white text-[14px] text-[#212121] placeholder-[#9ca3af] px-4 py-3 outline-none focus:border-cz-primary transition-colors"
    />
  )
}

function Select({ value }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between rounded-md border border-[#d1d5db] bg-white text-[14px] text-[#212121] px-4 py-3"
    >
      <span>{value}</span>
      <ChevronDownIcon size={14} />
    </button>
  )
}

function RadioCard({ active, name, price, onClick, children }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-md border p-4 transition-colors ${onClick ? 'cursor-pointer' : ''} ${
        active ? 'border-cz-primary ring-1 ring-cz-primary' : 'border-[#d1d5db]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${
              active ? 'border-cz-primary' : 'border-[#9ca3af]'
            }`}
          >
            {active && <span className="w-2 h-2 rounded-full bg-cz-primary" />}
          </span>
          <span className="font-medium text-[14px] text-[#212121]">{name}</span>
        </div>
        {price && <span className="text-[14px] text-[#212121]">{price}</span>}
      </div>
      {children && <div className="mt-3 text-[13px] text-[#4b4b4b] leading-relaxed">{children}</div>}
    </div>
  )
}

function PaymentMethodDetails({ methodKey, method }) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      {methodKey === 'cod' ? (
        <>
          Pay in cash when your order is delivered to your door. No advance payment required.
          {method.instructions && <><br /><br />{method.instructions}</>}
        </>
      ) : methodKey === 'bank_transfer' ? (
        <>
          Transfer your order amount to the following bank account.
          <br /><br />
          {method.bankName && <><b>{method.bankName}</b><br /></>}
          {method.accountTitle && <>Account Title: {method.accountTitle}<br /></>}
          {method.accountNumber && <>Account #: {method.accountNumber}</>}
          {method.instructions && <><br /><br />{method.instructions}</>}
          <br /><br />
          Please ensure the account name matches the customer's name where possible.
        </>
      ) : (
        <>
          Send your order amount to the following {method.label} account.
          <br /><br />
          {method.accountTitle && <>Account Title: {method.accountTitle}<br /></>}
          {method.number && <>{method.label} Number: {method.number}</>}
          {method.instructions && <><br /><br />{method.instructions}</>}
          <br /><br />
          Please ensure the account name matches the customer's name where possible.
        </>
      )}
    </div>
  )
}

export default function Checkout() {
  const { format } = useCurrency()
  const { items, subTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: user?.email || '',
    phone: user?.saved_phone || '',
    fullName: user?.name || '',
    address1: user?.saved_address || '',
    address2: '',
    city: user?.saved_city || 'Lahore',
    notes: '',
  })

  // When AuthContext finishes re-fetching the user (e.g. after a page refresh),
  // backfill any empty fields with the saved values without overwriting what the user has typed
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: prev.phone || user?.saved_phone || '',
      address1: prev.address1 || user?.saved_address || '',
      city: prev.city || user?.saved_city || 'Lahore',
    }))
  }, [user?.saved_phone, user?.saved_address, user?.saved_city]) // eslint-disable-line react-hooks/exhaustive-deps
  const [shippingFee, setShippingFee] = useState(1800)
  const [discountInput, setDiscountInput] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [discountError, setDiscountError] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState({})
  const [safepayEnabled, setSafepayEnabled] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [paymentReference, setPaymentReference] = useState('')

  useEffect(() => {
    api.get('/content/shipping-settings').then((data) => setShippingFee(Number(data.fee) || 1800)).catch(() => {})
    api
      .get('/content/payment-settings')
      .then((data) => {
        const methods = data.methods || {}
        setPaymentMethods(methods)
        const firstEnabled = Object.keys(methods).find((key) => methods[key].enabled)
        if (firstEnabled) setSelectedPaymentMethod(firstEnabled)
      })
      .catch(() => {})
    api
      .get('/payments/safepay/enabled')
      .then((data) => {
        if (data.enabled) {
          setSafepayEnabled(true)
          setSelectedPaymentMethod((prev) => prev ?? 'safepay')
        }
      })
      .catch(() => {})
  }, [])

  const enabledPaymentMethods = [
    ...(safepayEnabled ? [['safepay', { label: 'Pay Online via Safepay', isSafepay: true }]] : []),
    ...Object.entries(paymentMethods).filter(([, method]) => method.enabled),
  ]

  const shipping = items.length > 0 ? shippingFee : 0
  const discountAmount = appliedDiscount?.discount_amount || 0
  const total = Math.max(0, subTotal + shipping - discountAmount)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return
    setApplyingDiscount(true)
    setDiscountError('')
    try {
      const data = await api.post('/discount-codes/validate', { code: discountInput.trim(), subtotal: subTotal }, { auth: true })
      setAppliedDiscount(data)
    } catch (err) {
      setAppliedDiscount(null)
      setDiscountError(err.message)
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountInput('')
    setDiscountError('')
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: '/checkout' }} replace />
  }

  if (items.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedPaymentMethod) {
      setError('Please select a payment method')
      return
    }
    setSubmitting(true)
    try {
      const shippingAddress = [form.address1, form.address2].filter(Boolean).join(', ')
      const order = await api.post(
        '/orders',
        {
          shipping_name: form.fullName,
          shipping_address: shippingAddress,
          shipping_city: form.city,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          items: items.map((item) => ({ id: item.id, title: item.title, image: item.image, price: item.price, quantity: item.qty })),
          discount_code: appliedDiscount?.code,
          payment_method: selectedPaymentMethod,
          payment_reference: selectedPaymentMethod === 'safepay' ? undefined : paymentReference,
        },
        { auth: true }
      )

      if (selectedPaymentMethod === 'safepay') {
        // Create Safepay session and redirect — cart cleared on success page
        const { checkoutUrl } = await api.post(
          '/payments/safepay/session',
          { order_id: order.id },
          { auth: true }
        )
        window.location.href = checkoutUrl
        return
      }

      setOrderPlaced(true)
      clearCart()
      navigate('/account', { replace: true, state: { orderPlaced: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-[#dedede]">
        <div className="max-w-[1280px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5">
          <div className="flex justify-between items-center py-5">
            <Link to="/">
              <Logo textClassName="text-[22px]" />
            </Link>
            <Link to="/cart" aria-label="Cart" className="text-black">
              <CartIcon size={24} />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative" style={{ background: 'linear-gradient(90deg, transparent 50%, var(--color-cz-gold-light) 0)' }}>
        <div className="max-w-[1280px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-5 max-sm:!px-0">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="lg:pr-16 px-5 lg:px-0 pt-5 pb-10 lg:py-10">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between flex-wrap">
                  <h2 className="text-[18px] font-semibold text-[#212121]">Contact Information</h2>
                </div>

                {error && <div className="text-[13px] text-red-600">{error}</div>}

                <Input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                <Input name="phone" type="tel" placeholder="Enter your phone number" value={form.phone} onChange={handleChange} required />

                <h2 className="text-[18px] font-semibold text-[#212121] mt-6">Shipping Address</h2>
                <Input name="fullName" type="text" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
                <Input name="address1" type="text" placeholder="Address" value={form.address1} onChange={handleChange} required />
                <Input name="address2" type="text" placeholder="Address Line 2" value={form.address2} onChange={handleChange} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select value="Pakistan" />
                  <Select value="Punjab" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} />
                  <div />
                </div>

                <div className="flex items-center py-2">
                  <div className="relative inline-flex w-4 h-4 shrink-0 cursor-pointer select-none">
                    <input
                      id="same_as_shipping"
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="absolute inset-0 w-full h-full z-10 m-0 p-0 opacity-0 cursor-pointer"
                    />
                    <div
                      className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                        sameAsBilling ? 'bg-cz-primary border-cz-primary text-white' : 'bg-white border-[#cbd5e1]'
                      }`}
                    >
                      <CheckIcon size={11} />
                    </div>
                  </div>
                  <label htmlFor="same_as_shipping" className="ml-2 cursor-pointer text-[14px] text-[#212121]">
                    Use shipping address as billing address.
                  </label>
                </div>

                <h2 className="text-[18px] font-semibold text-[#212121] mt-4">Shipping Methods</h2>
                <RadioCard active name="Standard Delivery" price={format(shipping)} />

                <h2 className="text-[18px] font-semibold text-[#212121] mt-4">Payment</h2>
                {enabledPaymentMethods.length === 0 ? (
                  <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-[13px] px-4 py-3">
                    No payment methods are configured yet. Please contact us to complete your order.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {enabledPaymentMethods.map(([key, method]) => (
                      <RadioCard
                        key={key}
                        active={selectedPaymentMethod === key}
                        name={method.label}
                        onClick={() => setSelectedPaymentMethod(key)}
                      >
                        {selectedPaymentMethod === key && method.isSafepay && (
                          <div onClick={(e) => e.stopPropagation()}>
                            You'll be redirected to Safepay's secure checkout page to complete your payment. Your order
                            is confirmed automatically once payment goes through.
                          </div>
                        )}
                        {selectedPaymentMethod === key && !method.isSafepay && (
                          <PaymentMethodDetails methodKey={key} method={method} />
                        )}
                      </RadioCard>
                    ))}
                    {selectedPaymentMethod && selectedPaymentMethod !== 'safepay' && selectedPaymentMethod !== 'cod' && (
                      <Input
                        name="paymentReference"
                        type="text"
                        placeholder="Transaction ID / Reference (optional, speeds up confirmation)"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                      />
                    )}
                    <p className="text-[12px] text-[#9ca3af]">
                      By placing an order, you acknowledge and agree to our store policies and terms.
                      {selectedPaymentMethod !== 'safepay' && " We'll confirm your order once payment is received."}
                    </p>
                  </div>
                )}

                <h2 className="text-[18px] font-semibold text-[#212121] mt-4">Additional Information</h2>
                <textarea
                  name="notes"
                  placeholder="Special Instructions / Notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#d1d5db] bg-white text-[14px] text-[#212121] placeholder-[#9ca3af] px-4 py-3 outline-none focus:border-cz-primary resize-none"
                />
              </div>
            </div>

            <div className="px-5 lg:px-16 pb-10 pt-[30px] bg-cz-gold-light lg:bg-transparent">
              <div className="grid gap-y-4 mt-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center bg-white rounded-md p-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cz-primary text-white text-[11px] shrink-0">
                      {index + 1}
                    </span>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="aspect-square object-cover border rounded-lg w-[90px] h-[90px] ml-3"
                    />
                    <div className="flex flex-col ps-4 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-[14px] text-[#212121] line-clamp-2">
                          {item.title} × {item.qty}
                        </span>
                        <span className="text-[14px] text-[#212121] shrink-0">{format(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {appliedDiscount ? (
                  <div className="w-full flex items-center justify-between rounded-md border border-green-600 bg-green-50 px-4 py-3">
                    <span className="text-[14px] text-green-700">
                      Code <strong>{appliedDiscount.code}</strong> applied (-{format(discountAmount)})
                    </span>
                    <button type="button" onClick={handleRemoveDiscount} className="text-[13px] text-green-700 underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        name="discount"
                        placeholder="Discount / Promo code"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        className="flex-1 rounded-md border border-[#d1d5db] bg-white text-[14px] text-[#212121] placeholder-[#9ca3af] px-4 py-3 outline-none"
                      />
                      <button
                        type="button"
                        disabled={applyingDiscount || !discountInput.trim()}
                        onClick={handleApplyDiscount}
                        className="w-[100px] rounded-md bg-cz-primary text-white text-[14px] font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingDiscount ? '...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && <span className="text-[13px] text-red-600">{discountError}</span>}
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-[14px] text-[#212121]">
                    <span>Sub Total</span>
                    <span>{format(subTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px] text-[#212121]">
                    <span>Shipping</span>
                    <span>{format(shipping)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-[14px] text-green-700">
                      <span>Discount</span>
                      <span>-{format(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[16px] font-semibold text-[#212121] pt-2 border-t border-[#d1d5db]">
                    <span>Total</span>
                    <span>{format(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || enabledPaymentMethods.length === 0}
                  className="w-full rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[15px] font-medium py-4 mt-6 transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? selectedPaymentMethod === 'safepay' ? 'Redirecting to Safepay...' : 'Placing Order...'
                    : selectedPaymentMethod === 'safepay' ? 'Pay with Safepay →' : 'Complete Order'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
