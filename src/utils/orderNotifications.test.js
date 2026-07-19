import { describe, it, expect, beforeEach } from 'vitest'
import { getLastSeenOrderId, markOrdersSeen, SEEN_EVENT } from './orderNotifications'

const STORAGE_KEY = 'cz_admin_last_seen_order_id'

describe('orderNotifications', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getLastSeenOrderId', () => {
    it('returns 0 when nothing has been stored', () => {
      expect(getLastSeenOrderId()).toBe(0)
    })

    it('returns the stored numeric id', () => {
      localStorage.setItem(STORAGE_KEY, '42')
      expect(getLastSeenOrderId()).toBe(42)
    })

    it('returns 0 for a corrupted/non-numeric stored value', () => {
      localStorage.setItem(STORAGE_KEY, 'not-a-number')
      expect(getLastSeenOrderId()).toBe(0)
    })
  })

  describe('markOrdersSeen', () => {
    it('advances the watermark to the given id', () => {
      markOrdersSeen(10)
      expect(getLastSeenOrderId()).toBe(10)
    })

    it('is a no-op for a falsy latestId (0/null/undefined)', () => {
      localStorage.setItem(STORAGE_KEY, '5')
      markOrdersSeen(0)
      markOrdersSeen(null)
      markOrdersSeen(undefined)
      expect(getLastSeenOrderId()).toBe(5)
    })

    it('does not move the watermark backwards for an older id', () => {
      localStorage.setItem(STORAGE_KEY, '20')
      markOrdersSeen(10)
      expect(getLastSeenOrderId()).toBe(20)
    })

    it('does not move the watermark for the same id (already seen)', () => {
      localStorage.setItem(STORAGE_KEY, '20')
      markOrdersSeen(20)
      expect(getLastSeenOrderId()).toBe(20)
    })

    it('dispatches the SEEN_EVENT only when the watermark actually advances', () => {
      let fired = 0
      const handler = () => { fired += 1 }
      window.addEventListener(SEEN_EVENT, handler)

      markOrdersSeen(10) // advances -> fires
      markOrdersSeen(10) // same id -> no fire
      markOrdersSeen(5) // older -> no fire
      markOrdersSeen(20) // advances -> fires

      window.removeEventListener(SEEN_EVENT, handler)
      expect(fired).toBe(2)
    })
  })
})
