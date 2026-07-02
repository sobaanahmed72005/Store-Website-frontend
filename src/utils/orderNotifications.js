const LAST_SEEN_KEY = 'cz_admin_last_seen_order_id'
const SEEN_EVENT = 'cz-orders-seen'

export function getLastSeenOrderId() {
  return Number(localStorage.getItem(LAST_SEEN_KEY)) || 0
}

// Advances the "seen" watermark and notifies any mounted bell so its badge
// clears immediately, without needing a full page reload.
export function markOrdersSeen(latestId) {
  if (!latestId) return
  if (latestId <= getLastSeenOrderId()) return
  localStorage.setItem(LAST_SEEN_KEY, String(latestId))
  window.dispatchEvent(new CustomEvent(SEEN_EVENT))
}

export { SEEN_EVENT }
