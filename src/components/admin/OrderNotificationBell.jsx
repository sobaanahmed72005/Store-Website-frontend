import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'
import { getLastSeenOrderId, markOrdersSeen, SEEN_EVENT } from '../../utils/orderNotifications'
import { ADMIN_PATH } from '../../config/adminPath'
import { BellIcon } from '../icons'

const POLL_MS = 20_000
const BOOTSTRAP_KEY = 'cz_admin_notifications_bootstrapped'

export default function OrderNotificationBell() {
  const { format } = useCurrency()
  const [newOrders, setNewOrders] = useState([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const notifiedIds = useRef(new Set())
  const toastTimer = useRef(null)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        // First run ever: mark all existing orders as already-seen so the
        // admin isn't flooded with "new order" alerts for old history.
        if (!localStorage.getItem(BOOTSTRAP_KEY)) {
          const initial = await api.get('/admin/orders/new?since_id=999999999', { auth: true })
          markOrdersSeen(initial.latestId)
          localStorage.setItem(BOOTSTRAP_KEY, '1')
          return
        }

        const sinceId = getLastSeenOrderId()
        const data = await api.get(`/admin/orders/new?since_id=${sinceId}`, { auth: true })
        if (cancelled) return
        // Discard a stale response: if something else (e.g. visiting the Orders
        // page) advanced the seen-watermark while this request was in flight,
        // applying this result would resurrect an already-cleared badge.
        if (getLastSeenOrderId() !== sinceId) return
        setNewOrders(data.orders || [])

        const fresh = (data.orders || []).find((o) => !notifiedIds.current.has(o.id))
        if (fresh) {
          data.orders.forEach((o) => notifiedIds.current.add(o.id))
          setToast(fresh)
          clearTimeout(toastTimer.current)
          toastTimer.current = setTimeout(() => setToast(null), 6000)
        }
      } catch {
        // Notifications are best-effort — never surface polling errors to the admin.
      }
    }

    poll()
    const interval = setInterval(poll, POLL_MS)
    const onSeen = () => setNewOrders([])
    window.addEventListener(SEEN_EVENT, onSeen)
    return () => {
      cancelled = true
      clearInterval(interval)
      clearTimeout(toastTimer.current)
      window.removeEventListener(SEEN_EVENT, onSeen)
    }
  }, [])

  const handleViewAll = () => {
    if (newOrders[0]) markOrdersSeen(newOrders[0].id)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Order notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-[#4b4b4b] hover:text-cz-primary transition-colors"
      >
        <BellIcon size={20} />
        {newOrders.length > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-600 text-white text-[10px] font-semibold leading-none">
            {newOrders.length > 9 ? '9+' : newOrders.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 mt-2 w-[300px] bg-white border border-[#dedede] rounded-[10px] shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#dedede] text-[13px] font-semibold text-[#212121]">New Orders</div>
            {newOrders.length === 0 ? (
              <div className="px-4 py-6 text-[13px] text-[#9ca3af] text-center">No new orders.</div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {newOrders.map((o) => (
                  <div key={o.id} className="px-4 py-3 border-b border-[#f0f0f0] text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#212121]">Order #{o.id}</span>
                      <span className="text-[#4b4b4b]">{format(o.total_amount)}</span>
                    </div>
                    <div className="text-[12px] text-[#9ca3af] mt-0.5">
                      {o.customer_name} — {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              to={`${ADMIN_PATH}/orders`}
              onClick={handleViewAll}
              className="block text-center px-4 py-2.5 text-[13px] font-medium text-cz-primary hover:bg-cz-gold-light"
            >
              View All Orders
            </Link>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-white border border-cz-primary rounded-[10px] shadow-lg px-4 py-3 max-w-[280px]">
          <div className="text-[13px] font-semibold text-[#212121]">New order received!</div>
          <div className="text-[12px] text-[#4b4b4b] mt-0.5">
            Order #{toast.id} — {format(toast.total_amount)} from {toast.customer_name}
          </div>
        </div>
      )}
    </div>
  )
}
