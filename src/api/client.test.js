import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// api/client.js reads API_URL from config/env at module-eval time — stub it before importing
// the module under test so BASE_URL is deterministic regardless of .env.
vi.mock('../config/env', () => ({ API_URL: 'http://api.test/api' }))

function jsonResponse(body, { status = 200, ok = status >= 200 && status < 300 } = {}) {
  return {
    ok,
    status,
    headers: { get: (name) => (name === 'content-type' ? 'application/json' : null) },
    json: async () => body,
  }
}

function noBodyResponse({ status = 204, ok = true } = {}) {
  return {
    ok,
    status,
    headers: { get: () => null },
    json: async () => {
      throw new Error('should not be called when there is no JSON body')
    },
  }
}

describe('api/client', () => {
  let fetchMock

  beforeEach(() => {
    vi.resetModules()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('request() basics', () => {
    it('GET sends credentials, a store-slug header, and no body', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }))

      await api.get('/things')

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, opts] = fetchMock.mock.calls[0]
      expect(url).toBe('http://api.test/api/things')
      expect(opts.method).toBe('GET')
      expect(opts.credentials).toBe('include')
      expect(opts.body).toBeUndefined()
      expect(opts.headers['X-Store-Slug']).toBe('main')
      expect(opts.headers['Content-Type']).toBeUndefined()
    })

    it('POST with a body sets Content-Type and JSON-encodes the body', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: 1 }))

      await api.post('/things', { name: 'widget' })

      const [, opts] = fetchMock.mock.calls[0]
      expect(opts.method).toBe('POST')
      expect(opts.headers['Content-Type']).toBe('application/json')
      expect(opts.body).toBe(JSON.stringify({ name: 'widget' }))
    })

    it('put/patch/del send the right method', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValue(jsonResponse({}))

      await api.put('/x', { a: 1 })
      await api.patch('/x', { a: 1 })
      await api.del('/x')

      expect(fetchMock.mock.calls[0][1].method).toBe('PUT')
      expect(fetchMock.mock.calls[1][1].method).toBe('PATCH')
      expect(fetchMock.mock.calls[2][1].method).toBe('DELETE')
    })

    it('returns parsed JSON on success', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ hello: 'world' }))

      const data = await api.get('/things')

      expect(data).toEqual({ hello: 'world' })
    })

    it('returns null when the response has no JSON content-type', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(noBodyResponse())

      const data = await api.del('/things/1')

      expect(data).toBeNull()
    })

    it('throws an Error with the server message on a non-ok response', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Nope' }, { status: 400, ok: false }))

      await expect(api.post('/things', {})).rejects.toThrow('Nope')
    })

    it('falls back to a generic status message when the error body has no `error` field', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({}, { status: 500, ok: false }))

      await expect(api.get('/things')).rejects.toThrow('Request failed with status 500')
    })

    it('tags a 404 "Store not found" response with error.code = STORE_NOT_FOUND', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Store not found' }, { status: 404, ok: false }))

      try {
        await api.get('/content/site-settings')
        expect.unreachable()
      } catch (err) {
        expect(err.message).toBe('Store not found')
        expect(err.code).toBe('STORE_NOT_FOUND')
      }
    })

    it('does not tag a 404 with a different error message', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Product not found' }, { status: 404, ok: false }))

      try {
        await api.get('/products/nope')
        expect.unreachable()
      } catch (err) {
        expect(err.code).toBeUndefined()
      }
    })
  })

  describe('store slug derivation', () => {
    it('uses "main" for localhost/127.0.0.1', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({}))
      await api.get('/x')
      expect(fetchMock.mock.calls[0][1].headers['X-Store-Slug']).toBe('main')
    })

    it('uses the first hostname label as the slug on a multi-part host', async () => {
      vi.stubGlobal('location', { ...window.location, hostname: 'acme.storefront.example.com' })
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({}))

      await api.get('/x')

      expect(fetchMock.mock.calls[0][1].headers['X-Store-Slug']).toBe('acme')
    })

    it('falls back to "main" for a bare single-label host', async () => {
      vi.stubGlobal('location', { ...window.location, hostname: 'storefront' })
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({}))

      await api.get('/x')

      expect(fetchMock.mock.calls[0][1].headers['X-Store-Slug']).toBe('main')
    })
  })

  describe('401 refresh-and-retry', () => {
    it('refreshes once and retries the original request after a 401', async () => {
      const { api } = await import('./client')
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false })) // original
        .mockResolvedValueOnce(noBodyResponse({ status: 200 })) // /auth/refresh
        .mockResolvedValueOnce(jsonResponse({ ok: true })) // retried original

      const data = await api.get('/orders/mine')

      expect(fetchMock).toHaveBeenCalledTimes(3)
      expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/orders/mine')
      expect(fetchMock.mock.calls[1][0]).toBe('http://api.test/api/auth/refresh')
      expect(fetchMock.mock.calls[1][1].method).toBe('POST')
      expect(fetchMock.mock.calls[2][0]).toBe('http://api.test/api/orders/mine')
      expect(data).toEqual({ ok: true })
    })

    it('retries only once — a 401 on the retry itself is surfaced, not looped', async () => {
      const { api } = await import('./client')
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false })) // original
        .mockResolvedValueOnce(noBodyResponse({ status: 200 })) // refresh succeeds
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false })) // retry still 401

      await expect(api.get('/orders/mine')).rejects.toThrow('Unauthorized')
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('surfaces the original 401 as-is when refresh itself fails', async () => {
      const { api } = await import('./client')
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false })) // original
        .mockResolvedValueOnce(noBodyResponse({ status: 401, ok: false })) // refresh fails

      await expect(api.get('/orders/mine')).rejects.toThrow('Unauthorized')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('does not attempt a refresh at all when the failing request is /auth/login', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Invalid credentials' }, { status: 401, ok: false }))

      await expect(api.post('/auth/login', { email: 'a@b.com', password: 'x' })).rejects.toThrow(
        'Invalid credentials'
      )
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('does not attempt a refresh for /auth/refresh itself (no self-recursion)', async () => {
      const { api } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false }))

      await expect(api.post('/auth/refresh', {})).rejects.toThrow('Unauthorized')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('does not attempt a refresh for admin-login, register, logout, or 2fa endpoints', async () => {
      const { api } = await import('./client')
      const noRefreshPaths = ['/auth/admin-login', '/auth/register', '/auth/logout', '/auth/2fa/verify']

      for (const path of noRefreshPaths) {
        fetchMock.mockClear()
        fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false }))
        await expect(api.post(path, {})).rejects.toThrow('Unauthorized')
        expect(fetchMock).toHaveBeenCalledTimes(1)
      }
    })

    it('coalesces concurrent 401s into a single /auth/refresh call', async () => {
      const { api } = await import('./client')

      // Two independent requests both hit 401 at ~the same time.
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false })) // req A
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false })) // req B
        .mockResolvedValueOnce(noBodyResponse({ status: 200 })) // the single refresh call
        .mockResolvedValueOnce(jsonResponse({ from: 'A' })) // retried A
        .mockResolvedValueOnce(jsonResponse({ from: 'B' })) // retried B

      const [dataA, dataB] = await Promise.all([api.get('/cart/1'), api.get('/wishlist')])

      const refreshCalls = fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))
      expect(refreshCalls).toHaveLength(1)
      expect(dataA).toEqual({ from: 'A' })
      expect(dataB).toEqual({ from: 'B' })
    })

    it('issues a fresh refresh call for a later, separate 401 (the shared promise resets)', async () => {
      const { api } = await import('./client')
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false }))
        .mockResolvedValueOnce(noBodyResponse({ status: 200 }))
        .mockResolvedValueOnce(jsonResponse({ ok: 1 }))
      await api.get('/a')

      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false }))
        .mockResolvedValueOnce(noBodyResponse({ status: 200 }))
        .mockResolvedValueOnce(jsonResponse({ ok: 2 }))
      await api.get('/b')

      const refreshCalls = fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))
      expect(refreshCalls).toHaveLength(2)
    })
  })

  describe('uploadImage / uploadVideo', () => {
    it('uploadImage posts multipart form data with the file under "image"', async () => {
      const { uploadImage } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ url: '/uploads/x.png' }))
      const file = new File(['bytes'], 'photo.png', { type: 'image/png' })

      const data = await uploadImage(file)

      const [url, opts] = fetchMock.mock.calls[0]
      expect(url).toBe('http://api.test/api/admin/upload')
      expect(opts.method).toBe('POST')
      expect(opts.credentials).toBe('include')
      expect(opts.body).toBeInstanceOf(FormData)
      expect(opts.body.get('image')).toBe(file)
      expect(data).toEqual({ url: '/uploads/x.png' })
    })

    it('uploadImage throws with the server error message on failure', async () => {
      const { uploadImage } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'File too large' }, { status: 413, ok: false }))
      const file = new File(['bytes'], 'photo.png', { type: 'image/png' })

      await expect(uploadImage(file)).rejects.toThrow('File too large')
    })

    it('uploadVideo posts the file under "video" to the given endpoint', async () => {
      const { uploadVideo } = await import('./client')
      fetchMock.mockResolvedValueOnce(jsonResponse({ url: '/uploads/x.mp4' }))
      const file = new File(['bytes'], 'clip.mp4', { type: 'video/mp4' })

      await uploadVideo(file, '/admin/upload-video-custom')

      const [url, opts] = fetchMock.mock.calls[0]
      expect(url).toBe('http://api.test/api/admin/upload-video-custom')
      expect(opts.body.get('video')).toBe(file)
    })

    it('upload helpers also go through the 401 refresh-and-retry path', async () => {
      const { uploadImage } = await import('./client')
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, { status: 401, ok: false }))
        .mockResolvedValueOnce(noBodyResponse({ status: 200 }))
        .mockResolvedValueOnce(jsonResponse({ url: '/uploads/x.png' }))
      const file = new File(['bytes'], 'photo.png', { type: 'image/png' })

      const data = await uploadImage(file)

      expect(fetchMock).toHaveBeenCalledTimes(3)
      expect(data).toEqual({ url: '/uploads/x.png' })
    })
  })

  describe('resolveImageUrl', () => {
    it('returns null for a falsy image', async () => {
      const { resolveImageUrl } = await import('./client')
      expect(resolveImageUrl(null)).toBeNull()
      expect(resolveImageUrl('')).toBeNull()
    })

    it('returns an absolute http(s) URL unchanged', async () => {
      const { resolveImageUrl } = await import('./client')
      expect(resolveImageUrl('https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png')
      expect(resolveImageUrl('http://cdn.example.com/x.png')).toBe('http://cdn.example.com/x.png')
    })

    it('prefixes a relative path with the API origin (stripping /api)', async () => {
      const { resolveImageUrl } = await import('./client')
      expect(resolveImageUrl('/uploads/x.png')).toBe('http://api.test/uploads/x.png')
    })
  })
})
