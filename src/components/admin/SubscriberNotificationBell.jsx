import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { getLastSeenSubscriberId, markSubscribersSeen, SEEN_EVENT } from '../../utils/subscriberNotifications'
import { ADMIN_PATH } from '../../config/adminPath'
import { BellIcon } from '../icons'

const POLL_MS = 20_000
const BOOTSTRAP_KEY = 'cz_admin_subscriber_notifications_bootstrapped'

export default function SubscriberNotificationBell() {
  const [newSubscribers, setNewSubscribers] = useState([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const notifiedIds = useRef(new Set())
  const toastTimer = useRef(null)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        // First run ever: mark all existing subscribers as already-seen so the
        // admin isn't flooded with "new subscriber" alerts for old history.
        if (!localStorage.getItem(BOOTSTRAP_KEY)) {
          const initial = await api.get(ENDPOINTS.ADMIN.NEWSLETTER.NEW(999999999), { auth: true })
          markSubscribersSeen(initial.latestId)
          localStorage.setItem(BOOTSTRAP_KEY, '1')
          return
        }

        const sinceId = getLastSeenSubscriberId()
        const data = await api.get(ENDPOINTS.ADMIN.NEWSLETTER.NEW(sinceId), { auth: true })
        if (cancelled) return
        // Discard a stale response: if something else (e.g. visiting the Newsletter
        // page) advanced the seen-watermark while this request was in flight,
        // applying this result would resurrect an already-cleared badge.
        if (getLastSeenSubscriberId() !== sinceId) return
        setNewSubscribers(data.subscribers || [])

        const fresh = (data.subscribers || []).find((s) => !notifiedIds.current.has(s.id))
        if (fresh) {
          data.subscribers.forEach((s) => notifiedIds.current.add(s.id))
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
    const onSeen = () => setNewSubscribers([])
    window.addEventListener(SEEN_EVENT, onSeen)
    return () => {
      cancelled = true
      clearInterval(interval)
      clearTimeout(toastTimer.current)
      window.removeEventListener(SEEN_EVENT, onSeen)
    }
  }, [])

  const handleViewAll = () => {
    if (newSubscribers[0]) markSubscribersSeen(newSubscribers[0].id)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Subscriber notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-[#4b4b4b] hover:text-cz-primary transition-colors"
      >
        <BellIcon size={20} />
        {newSubscribers.length > 0 && (
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-[15px] px-[3px] rounded-full bg-red-600 text-white text-[10px] font-semibold leading-none">
            {newSubscribers.length > 9 ? '9+' : newSubscribers.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 mt-2 w-[300px] bg-white border border-[#dedede] rounded-[10px] shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#dedede] text-[13px] font-semibold text-[#212121]">New Subscribers</div>
            {newSubscribers.length === 0 ? (
              <div className="px-4 py-6 text-[13px] text-[#9ca3af] text-center">No new subscribers.</div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {newSubscribers.map((s) => (
                  <div key={s.id} className="px-4 py-3 border-b border-[#f0f0f0] text-[13px]">
                    <div className="font-medium text-[#212121]">{s.email}</div>
                    <div className="text-[12px] text-[#9ca3af] mt-0.5">
                      {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              to={`${ADMIN_PATH}/newsletter`}
              onClick={handleViewAll}
              className="block text-center px-4 py-2.5 text-[13px] font-medium text-cz-primary hover:bg-cz-gold-light"
            >
              View All Subscribers
            </Link>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-white border border-cz-primary rounded-[10px] shadow-lg px-4 py-3 max-w-[280px]">
          <div className="text-[13px] font-semibold text-[#212121]">New newsletter subscriber!</div>
          <div className="text-[12px] text-[#4b4b4b] mt-0.5">{toast.email}</div>
        </div>
      )}
    </div>
  )
}
