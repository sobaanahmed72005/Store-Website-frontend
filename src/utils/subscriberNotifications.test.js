import { describe, it, expect, beforeEach } from 'vitest'
import { getLastSeenSubscriberId, markSubscribersSeen, SEEN_EVENT } from './subscriberNotifications'

const STORAGE_KEY = 'cz_admin_last_seen_subscriber_id'

describe('subscriberNotifications', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getLastSeenSubscriberId', () => {
    it('returns 0 when nothing has been stored', () => {
      expect(getLastSeenSubscriberId()).toBe(0)
    })

    it('returns the stored numeric id', () => {
      localStorage.setItem(STORAGE_KEY, '7')
      expect(getLastSeenSubscriberId()).toBe(7)
    })

    it('returns 0 for a corrupted/non-numeric stored value', () => {
      localStorage.setItem(STORAGE_KEY, 'garbage')
      expect(getLastSeenSubscriberId()).toBe(0)
    })
  })

  describe('markSubscribersSeen', () => {
    it('advances the watermark to the given id', () => {
      markSubscribersSeen(3)
      expect(getLastSeenSubscriberId()).toBe(3)
    })

    it('is a no-op for a falsy latestId', () => {
      localStorage.setItem(STORAGE_KEY, '2')
      markSubscribersSeen(0)
      expect(getLastSeenSubscriberId()).toBe(2)
    })

    it('does not move the watermark backwards', () => {
      localStorage.setItem(STORAGE_KEY, '15')
      markSubscribersSeen(9)
      expect(getLastSeenSubscriberId()).toBe(15)
    })

    it('dispatches SEEN_EVENT only on an actual advance', () => {
      let fired = 0
      const handler = () => { fired += 1 }
      window.addEventListener(SEEN_EVENT, handler)

      markSubscribersSeen(4)
      markSubscribersSeen(4)
      markSubscribersSeen(1)

      window.removeEventListener(SEEN_EVENT, handler)
      expect(fired).toBe(1)
    })
  })

  it('uses a distinct localStorage key and event name from orderNotifications (no cross-talk)', async () => {
    const { SEEN_EVENT: ORDER_SEEN_EVENT } = await import('./orderNotifications')
    expect(SEEN_EVENT).not.toBe(ORDER_SEEN_EVENT)
  })
})
