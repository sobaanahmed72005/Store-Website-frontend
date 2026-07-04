import { Fragment, useEffect, useState } from 'react'
import { api, BASE_URL, resolveImageUrl } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'
import { markOrdersSeen } from '../../utils/orderNotifications'

// What statuses can be selected from each current status
const STATUS_TRANSITIONS = {
  pending:           ['confirmed', 'cancelled'],
  confirmed:         ['packed', 'cancelled'],
  packed:            ['shipped', 'cancelled'],
  shipped:           ['out_for_delivery'],
  out_for_delivery:  ['delivered'],
  delivered:         ['returned'],
  returned:          [],
  cancelled:         [],
  pending_payment:   [],
}

const STATUS_LABEL = {
  pending_payment:  'Awaiting Payment',
  pending:          'Pending Confirmation',
  confirmed:        'Confirmed',
  packed:           'Packed',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  returned:         'Returned',
  cancelled:        'Cancelled',
}

const STATUS_STYLE = {
  pending_payment:  'bg-blue-100 text-blue-700',
  pending:          'bg-cz-gold-light text-cz-ink',
  confirmed:        'bg-cz-accent text-cz-ink',
  packed:           'bg-cz-lavender text-cz-ink',
  shipped:          'bg-cz-sky text-cz-ink',
  out_for_delivery: 'bg-amber-200 text-amber-900',
  delivered:        'bg-cz-primary text-white',
  returned:         'bg-purple-100 text-purple-700',
  cancelled:        'bg-red-100 text-red-700',
}

const PAYMENT_METHOD_LABEL = {
  bank_transfer: 'Bank Transfer',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  cod: 'Cash on Delivery',
}

export default function AdminOrders() {
  const { format } = useCurrency()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [trackingDrafts, setTrackingDrafts] = useState({})
  const [savingTrackingId, setSavingTrackingId] = useState(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null)
  const [bookingCourierId, setBookingCourierId] = useState(null)
  const [notice, setNotice] = useState('')

  const fetchOrders = () =>
    api
      .get('/admin/orders', { auth: true })
      .then((data) => {
        setOrders(data)
        if (data.length) markOrdersSeen(Math.max(...data.map((o) => o.id)))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id)
    setError('')
    setNotice('')
    try {
      const result = await api.put(`/admin/orders/${id}/status`, { status }, { auth: true })
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status, ...(result.tracking_number ? { courier_name: result.courier_name, tracking_number: result.tracking_number } : {}) }
            : o
        )
      )
      if (result.tracking_number) {
        setNotice(`Order #${id} auto-booked with Leopards — tracking number ${result.tracking_number}.`)
      } else if (result.courier_warning) {
        setError(`Order #${id} marked Shipped, but Leopards booking failed: ${result.courier_warning}. You can retry from the order details, or enter tracking manually.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBookCourier = async (orderId) => {
    setBookingCourierId(orderId)
    setError('')
    setNotice('')
    try {
      const result = await api.post(`/admin/orders/${orderId}/book-courier`, {}, { auth: true })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, courier_name: result.courier_name, tracking_number: result.tracking_number } : o)))
      setTrackingDrafts((prev) => ({ ...prev, [orderId]: { courier_name: result.courier_name, tracking_number: result.tracking_number } }))
      setNotice(`Order #${orderId} booked with Leopards — tracking number ${result.tracking_number}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBookingCourierId(null)
    }
  }

  const toggleExpand = async (order) => {
    if (expandedId === order.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(order.id)
    if (!order.items) {
      try {
        const detail = await api.get(`/admin/orders/${order.id}`, { auth: true })
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, items: detail.items } : o)))
      } catch (err) {
        setError(err.message)
      }
    }
    setTrackingDrafts((prev) =>
      prev[order.id]
        ? prev
        : { ...prev, [order.id]: { courier_name: order.courier_name || '', tracking_number: order.tracking_number || '' } }
    )
  }

  const updateTrackingDraft = (orderId, field, value) =>
    setTrackingDrafts((prev) => ({ ...prev, [orderId]: { ...prev[orderId], [field]: value } }))

  const handleDownloadInvoice = async (orderId, e) => {
    e.stopPropagation()
    setDownloadingInvoiceId(orderId)
    setError('')
    try {
      const slug = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'main'
        : window.location.hostname.split('.')[0]
      const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/invoice`, {
        headers: { 'X-Store-Slug': slug },
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to generate invoice')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  const handleSaveTracking = async (orderId) => {
    setSavingTrackingId(orderId)
    setError('')
    try {
      const draft = trackingDrafts[orderId]
      await api.put(`/admin/orders/${orderId}/tracking`, draft, { auth: true })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...draft } : o)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingTrackingId(null)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Orders</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {notice && <div className="text-[14px] text-green-700 mb-4">{notice}</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <Fragment key={order.id}>
                  <tr className="border-t border-[#dedede] cursor-pointer" onClick={() => toggleExpand(order)}>
                    <td className="px-4 py-3 text-[#212121] font-medium">#{order.id}</td>
                    <td className="px-4 py-3 text-[#212121]">
                      {order.customer_name}
                      <div className="text-[12px] text-[#9ca3af]">{order.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#4b4b4b]">{order.item_count}</td>
                    <td className="px-4 py-3 text-[#212121]">{format(order.total_amount)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const transitions = STATUS_TRANSITIONS[order.status] ?? []
                        const badge = (
                          <span className={`rounded-full text-[12px] font-medium px-3 py-1 ${STATUS_STYLE[order.status] || ''}`}>
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                        )
                        // No transitions possible — show badge only
                        if (transitions.length === 0) return badge
                        // Pending — show badge + quick Confirm button
                        if (order.status === 'pending') return (
                          <div className="flex items-center gap-2">
                            {badge}
                            <button
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={() => handleStatusChange(order.id, 'confirmed')}
                              className="rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[12px] font-medium px-3 py-1 transition-colors disabled:opacity-60"
                            >
                              {updatingId === order.id ? 'Confirming...' : 'Confirm Order'}
                            </button>
                          </div>
                        )
                        // All other statuses with transitions — dropdown showing current + allowed next statuses
                        return (
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`rounded-full text-[12px] font-medium px-3 py-1 border-none outline-none cursor-pointer ${STATUS_STYLE[order.status] || ''}`}
                          >
                            <option value={order.status}>{STATUS_LABEL[order.status]}</option>
                            {transitions.map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-[#4b4b4b]">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="border-t border-[#dedede] bg-cz-gold-light">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="text-[13px] text-[#4b4b4b] mb-2">
                          Shipping: {order.shipping_name}, {order.shipping_address}
                          {order.shipping_city ? `, ${order.shipping_city}` : ''} — {order.phone}
                        </div>
                        {order.payment_method && (
                          <div className="text-[13px] text-[#4b4b4b] mb-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>
                                Payment: {PAYMENT_METHOD_LABEL[order.payment_method] || order.payment_method}
                                {order.payment_reference ? ` — Ref: ${order.payment_reference}` : ''}
                              </span>
                              {!!order.is_duplicate_reference && (
                                <span className="rounded-full bg-red-100 text-red-700 text-[11px] font-medium px-2 py-0.5">
                                  Reference reused on another order — verify carefully
                                </span>
                              )}
                            </div>
                            {order.payment_proof_image && (
                              <a
                                href={resolveImageUrl(order.payment_proof_image)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2"
                              >
                                <img
                                  src={resolveImageUrl(order.payment_proof_image)}
                                  alt="Payment proof"
                                  className="h-20 w-auto rounded border border-[#dedede] object-cover"
                                />
                              </a>
                            )}
                          </div>
                        )}
                        {order.items ? (
                          <div className="flex flex-col gap-1 mb-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-[13px] text-[#212121]">
                                <span>
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span>{format(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[13px] text-[#9ca3af] mb-3">Loading items...</div>
                        )}

                        <div className="flex flex-wrap items-end justify-between gap-2 pt-3 border-t border-[#dedede]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap items-end gap-2">
                            <div>
                              <label className="block text-[12px] text-[#4b4b4b] mb-1">Courier</label>
                              <input
                                value={trackingDrafts[order.id]?.courier_name ?? ''}
                                onChange={(e) => updateTrackingDraft(order.id, 'courier_name', e.target.value)}
                                placeholder="Leopards Courier"
                                className="rounded-md border border-[#d1d5db] text-[13px] px-2.5 py-2 outline-none focus:border-cz-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-[12px] text-[#4b4b4b] mb-1">Tracking Number</label>
                              <input
                                value={trackingDrafts[order.id]?.tracking_number ?? ''}
                                onChange={(e) => updateTrackingDraft(order.id, 'tracking_number', e.target.value)}
                                placeholder="CN number"
                                className="rounded-md border border-[#d1d5db] text-[13px] px-2.5 py-2 outline-none focus:border-cz-primary"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={savingTrackingId === order.id}
                              onClick={() => handleSaveTracking(order.id)}
                              className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] font-medium px-4 py-2 transition-colors disabled:opacity-60"
                            >
                              {savingTrackingId === order.id ? 'Saving...' : 'Save Tracking'}
                            </button>
                            {!order.tracking_number && ['packed', 'shipped'].includes(order.status) && (
                              <button
                                type="button"
                                disabled={bookingCourierId === order.id}
                                onClick={() => handleBookCourier(order.id)}
                                className="rounded-md border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[13px] font-medium px-4 py-2 transition-colors disabled:opacity-60"
                              >
                                {bookingCourierId === order.id ? 'Booking...' : 'Book with Leopards'}
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={downloadingInvoiceId === order.id}
                            onClick={(e) => handleDownloadInvoice(order.id, e)}
                            className="rounded-md border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[13px] font-medium px-4 py-2 transition-colors disabled:opacity-60"
                          >
                            {downloadingInvoiceId === order.id ? 'Generating...' : '↓ Download Invoice'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
