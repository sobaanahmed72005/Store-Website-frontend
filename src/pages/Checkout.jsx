import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import CategoryMenu from '../components/CategoryMenu'
import Footer from '../components/Footer'
import { ChevronDownIcon } from '../components/icons'
import { useCurrency } from '../store/currencyStore'
import { useCart } from '../store/cartStore'
import { useAuth } from '../store/authStore'
import { useSiteSettings } from '../store/siteSettingsStore'
import { api, uploadImage } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { useSeo } from '../hooks/useSeo'
import SeoHeadingFiller from '../components/SeoHeadingFiller'

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 placeholder-slate-400 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
    />
  )
}

const CITY_SUGGESTIONS = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar',
  'Quetta', 'Sialkot', 'Gujranwala', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana',
  'Burewala', 'Vehari', 'Sahiwal', 'Hyderabad', 'Abbottabad', 'Gujrat',
]

function Select({ value }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5"
    >
      <span>{value}</span>
      <ChevronDownIcon size={14} className="text-slate-500" />
    </button>
  )
}

function RadioCard({ active, name, price, onClick, children, groupName, value }) {
  const card = (
    <div
      className={`rounded-xl border p-4 transition-all ${
        active ? 'border-cz-primary bg-sky-50/30 ring-1 ring-cz-primary' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClick ? (
            <input
              type="radio"
              name={groupName}
              value={value}
              checked={active}
              onChange={onClick}
              className="w-4 h-4 shrink-0 accent-cz-primary cursor-pointer"
            />
          ) : (
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${
                active ? 'border-cz-primary' : 'border-slate-300'
              }`}
            >
              {active && <span className="w-2 h-2 rounded-full bg-cz-primary" />}
            </span>
          )}
          <span className="font-semibold text-[14px] text-slate-800">{name}</span>
        </div>
        {price && <span className="text-[14px] font-bold text-slate-800">{price}</span>}
      </div>
      {children && <div className="mt-3 text-[13px] text-slate-600 leading-relaxed">{children}</div>}
    </div>
  )

  if (!onClick) return card
  return <label className="block cursor-pointer">{card}</label>
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
          Enter your reference number below and upload a payment proof screenshot.
        </>
      ) : (
        <>
          {method.instructions || 'Send your payment using the details provided by this gateway, then enter your transaction reference below.'}
        </>
      )}
    </div>
  )
}

export default function Checkout() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Checkout — Complete Your Order | ${siteName || 'IT Solutions'}`,
    canonical: `${window.location.origin}/checkout`,
    noindex: true,
  })

  const { format } = useCurrency()
  const { items, subTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [shippingMethods, setShippingMethods] = useState([])
  const [selectedShippingId, setSelectedShippingId] = useState(null)
  const [isFirstOrder, setIsFirstOrder] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentProofImage, setPaymentProofImage] = useState('')
  const [uploadingProof, setUploadingProof] = useState(false)
  const [proofError, setProofError] = useState('')

  const [form, setForm] = useState({
    email: '',
    phone: '',
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    notes: '',
  })

  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [discountInput, setDiscountInput] = useState('')
  const [discountError, setDiscountError] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    api
      .get(ENDPOINTS.CONTENT.SHIPPING_SETTINGS)
      .then((data) => {
        const methods = Array.isArray(data?.methods) ? data.methods : []
        const activeMethods = methods.filter((m) => m.enabled)
        setShippingMethods(activeMethods)
        if (activeMethods.length > 0) setSelectedShippingId(activeMethods[0].id)
      })
      .catch((err) => console.error('Failed to load shipping methods:', err))

    api
      .get(ENDPOINTS.CONTENT.PAYMENT_SETTINGS)
      .then((data) => {
        const methods = data?.methods || data || {}
        setPaymentMethods(methods)
        if (methods?.cod?.enabled) setSelectedPaymentMethod('cod')
        else if (methods?.bank_transfer?.enabled) setSelectedPaymentMethod('bank_transfer')
        else if (methods?.custom?.enabled) setSelectedPaymentMethod('custom')
      })
      .catch((err) => console.error('Failed to load payment methods:', err))
  }, [])

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.name || prev.fullName,
      }))

      api
        .get(ENDPOINTS.ORDERS.BY_USER(user.id), { auth: true })
        .then((data) => {
          const list = Array.isArray(data?.orders) ? data.orders : []
          setIsFirstOrder(list.length === 0)
        })
        .catch(() => setIsFirstOrder(false))
    }
  }, [user])

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return
    setApplyingDiscount(true)
    setDiscountError('')
    try {
      const result = await api.post(ENDPOINTS.DISCOUNT_CODES.VALIDATE, { code: discountInput.trim(), subTotal })
      if (result.valid) {
        setAppliedDiscount(result.discount)
        setDiscountInput('')
      } else {
        setDiscountError(result.message || 'Invalid discount code')
      }
    } catch (err) {
      setDiscountError(err.message || 'Failed to validate discount code')
    } finally {
      setApplyingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => setAppliedDiscount(null)

  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingId)
  const shippingFee = selectedShipping ? Number(selectedShipping.fee) : 0
  const shipping = isFirstOrder ? 0 : shippingFee

  let discountAmount = 0
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      discountAmount = Math.round((subTotal * Number(appliedDiscount.value)) / 100)
    } else {
      discountAmount = Number(appliedDiscount.value)
    }
    if (discountAmount > subTotal) discountAmount = subTotal
  }

  const total = Math.max(0, subTotal + shipping - discountAmount)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingProof(true)
    setProofError('')
    try {
      const url = await uploadImage(file)
      setPaymentProofImage(url)
    } catch (err) {
      setProofError(err.message || 'Failed to upload screenshot')
    } finally {
      setUploadingProof(false)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return <Navigate to="/cart" replace />
  }

  const enabledPaymentMethods = paymentMethods
    ? Object.entries(paymentMethods).filter(([, m]) => m?.enabled)
    : []

  const isFormComplete =
    form.email.trim() &&
    form.phone.trim() &&
    form.fullName.trim() &&
    form.address1.trim() &&
    selectedPaymentMethod &&
    (selectedPaymentMethod === 'cod' || (paymentReference.trim() && paymentProofImage))

  const helplinePhone = paymentMethods?.bank_transfer?.helplinePhone || ''
  const helplineEmail = paymentMethods?.bank_transfer?.helplineEmail || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!selectedPaymentMethod) {
      setError('Please select a payment method')
      return
    }
    if (selectedPaymentMethod !== 'cod' && (!paymentReference.trim() || !paymentProofImage)) {
      setError('Please enter your transaction reference and upload a screenshot of your payment')
      return
    }
    setSubmitting(true)
    try {
      const shippingAddress = [form.address1, form.address2].filter(Boolean).join(', ')
      await api.post(
        ENDPOINTS.ORDERS.BASE,
        {
          shipping_name: form.fullName,
          shipping_address: shippingAddress,
          shipping_city: form.city,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          items: items.map((item) => ({ id: item.id, variantId: item.variantId ?? null, title: item.title, image: item.image, price: item.price, quantity: item.qty })),
          discount_code: appliedDiscount?.code,
          payment_method: selectedPaymentMethod,
          payment_reference: paymentReference,
          payment_proof_image: paymentProofImage,
        },
        { auth: true }
      )

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <Header />
      <CategoryMenu />

      <main className="max-w-[1000px] w-full mx-auto px-4 sm:px-5 py-6 sm:py-8 flex-1">
        {/* Left-Aligned Ocean Navy Title Heading (No Breadcrumbs) */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[24px] sm:text-[30px] font-bold text-[#0c4a6e] font-heading tracking-tight">
            Checkout
          </h1>
          <SeoHeadingFiller h3="Order review" h4="Discount code" h5="Payment proof upload" h6="Terms notice" />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-10 items-start w-full">
          {/* Left Column: Contact, Shipping & Payment Form Card */}
          <div className="lg:col-span-7 col-span-12 bg-white rounded-xl border border-slate-100 p-5 sm:p-7 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-800 font-heading mb-3 pb-2 border-b border-slate-100">
                Contact Information
              </h2>
              {error && <div className="text-[13px] text-rose-600 mb-3 bg-rose-50 border border-rose-200 p-3 rounded-lg">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Email Address *</label>
                  <Input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <Input name="phone" type="tel" placeholder="Enter your phone number" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-800 font-heading mb-3 pb-2 border-b border-slate-100">
                Shipping Address
              </h2>
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Full Name *</label>
                  <Input name="fullName" type="text" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Address *</label>
                  <Input name="address1" type="text" placeholder="House / Building / Street address" value={form.address1} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Address Line 2 (Optional)</label>
                  <Input name="address2" type="text" placeholder="Apartment, suite, unit, etc." value={form.address2} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Select value="Pakistan" />
                  <Select value="Punjab" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">City *</label>
                  <Input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} list="city-suggestions" autoComplete="off" />
                  <datalist id="city-suggestions">
                    {CITY_SUGGESTIONS.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-800 font-heading mb-3 pb-2 border-b border-slate-100">
                Shipping Method
              </h2>
              {shippingMethods.length === 0 ? (
                <p className="text-[13px] text-slate-500">Standard Delivery</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {shippingMethods.map((method) => (
                    <RadioCard
                      key={method.id}
                      active={selectedShippingId === method.id}
                      name={method.name}
                      price={isFirstOrder ? 'FREE' : format(Number(method.fee))}
                      groupName="shipping-method"
                      value={method.id}
                      onClick={() => setSelectedShippingId(method.id)}
                    >
                      {method.description}
                    </RadioCard>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-800 font-heading mb-3 pb-2 border-b border-slate-100">
                Payment Method
              </h2>
              {enabledPaymentMethods.length === 0 ? (
                <p className="text-[13px] text-rose-600">No payment methods are currently available. Please contact store support.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {enabledPaymentMethods.map(([key, method]) => (
                    <RadioCard
                      key={key}
                      active={selectedPaymentMethod === key}
                      name={method.label}
                      groupName="payment-method"
                      value={key}
                      onClick={() => setSelectedPaymentMethod(key)}
                    >
                      {selectedPaymentMethod === key && (
                        <PaymentMethodDetails methodKey={key} method={method} />
                      )}
                    </RadioCard>
                  ))}
                  {selectedPaymentMethod && selectedPaymentMethod !== 'cod' && (
                    <div className="flex flex-col gap-3 pt-2">
                      <Input
                        name="paymentReference"
                        type="text"
                        placeholder="Transaction ID / Reference"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        required
                      />
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1">
                          Upload Payment Screenshot *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          className="w-full text-[13px] text-slate-600 cursor-pointer"
                        />
                        {uploadingProof && <p className="text-[12px] text-slate-400 mt-1">Uploading screenshot...</p>}
                        {paymentProofImage && !uploadingProof && (
                          <p className="text-[12px] text-emerald-700 font-semibold mt-1">Screenshot uploaded ✓</p>
                        )}
                        {proofError && <p className="text-[12px] text-rose-600 mt-1">{proofError}</p>}
                      </div>
                      {(helplinePhone || helplineEmail) && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 text-[12px] text-slate-600 p-3.5">
                          Facing an issue while transferring your payment? Contact helpline
                          {helplinePhone && <> at <a href={`tel:${helplinePhone}`} className="text-cz-primary font-bold hover:underline">{helplinePhone}</a></>}
                          {helplinePhone && helplineEmail && ' or'}
                          {helplineEmail && <> email <a href={`mailto:${helplineEmail}`} className="text-cz-primary font-bold hover:underline">{helplineEmail}</a></>}
                          .
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-800 font-heading mb-2 pb-2 border-b border-slate-100">
                Additional Notes
              </h2>
              <textarea
                name="notes"
                placeholder="Special Instructions / Notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 placeholder-slate-400 p-3 outline-none focus:border-cz-primary focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 col-span-12 sticky top-4 bg-white border border-slate-100 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-[17px] font-bold text-slate-800 font-heading pb-3 mb-3 border-b border-slate-100">
              Order Items ({items.length})
            </h3>

            {isFirstOrder && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2.5 text-emerald-800 text-[12px] font-medium">
                <span className="text-base">🎉</span>
                <div>
                  <p className="font-bold text-[13px]">First Order Special Offer!</p>
                  <p className="text-[11px] text-emerald-700">Free nationwide delivery applied.</p>
                </div>
              </div>
            )}

            {/* Item List */}
            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1 mb-4 border-b border-slate-100 pb-3">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.variantId ?? ''}`} className="flex items-center gap-3">
                  <div className="w-[52px] h-[52px] rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} width={52} height={52} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.variantLabel && `${item.variantLabel} • `}Qty: {item.qty}
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 shrink-0">{format(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Discount Code Input */}
            <div className="mb-4 pb-4 border-b border-slate-100">
              {appliedDiscount ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-[13px]">
                  <span className="text-emerald-800 font-semibold">
                    Code <strong>{appliedDiscount.code}</strong> applied (-{format(discountAmount)})
                  </span>
                  <button type="button" onClick={handleRemoveDiscount} className="text-[12px] font-bold text-emerald-800 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="discount"
                      placeholder="Discount / Promo code"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] text-slate-800 placeholder-slate-400 px-3.5 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      disabled={applyingDiscount || !discountInput.trim()}
                      onClick={handleApplyDiscount}
                      className="rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-semibold px-4 py-2.5 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {applyingDiscount ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discountError && <span className="text-[12px] text-rose-600 font-medium">{discountError}</span>}
                </div>
              )}
            </div>

            {/* Subtotal, Shipping, Total */}
            <div className="flex flex-col gap-2 text-[13px] text-slate-600 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span>Sub Total</span>
                <span className="font-semibold text-slate-800">{format(subTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>
                  {isFirstOrder ? (
                    <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                      <span className="line-through text-slate-400 font-normal text-[12px]">{format(shippingFee)}</span>
                      <span>FREE</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-800">{format(shipping)}</span>
                  )}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>-{format(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[16px] font-bold text-slate-800 mb-5 font-heading">
              <span>Total</span>
              <span className="text-cz-primary text-[19px]">{format(total)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || uploadingProof || enabledPaymentMethods.length === 0 || !isFormComplete}
              className="w-full rounded-xl bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-bold py-3.5 transition-all shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Placing Order...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
