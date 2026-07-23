import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../api/client', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

import { api } from '../api/client'
import { useAuthStore, useAuth } from './authStore'

function resetStore() {
  useAuthStore.setState({ user: null, loading: false, initializing: true })
}

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStore()
  })

  describe('init', () => {
    it('sets user from /auth/me and clears initializing on success', async () => {
      api.get.mockResolvedValueOnce({ user: { id: 1, email: 'a@b.com' } })

      useAuthStore.getState().init()
      await vi.waitFor(() => expect(useAuthStore.getState().initializing).toBe(false))

      expect(useAuthStore.getState().user).toEqual({ id: 1, email: 'a@b.com' })
    })

    it('sets user to null and clears initializing on failure (no session)', async () => {
      api.get.mockRejectedValueOnce(new Error('Unauthorized'))

      useAuthStore.getState().init()
      await vi.waitFor(() => expect(useAuthStore.getState().initializing).toBe(false))

      expect(useAuthStore.getState().user).toBeNull()
    })

    it('leaves initializing true and user null while the request is in flight', () => {
      let resolveGet
      api.get.mockReturnValueOnce(new Promise((resolve) => { resolveGet = resolve }))

      useAuthStore.getState().init()

      expect(useAuthStore.getState().initializing).toBe(true)
      expect(useAuthStore.getState().user).toBeNull()
      resolveGet({ user: { id: 1 } })
    })

    it('does not adopt an admin identity on a storefront tab (stray admin cookie from another tab)', async () => {
      window.history.pushState({}, '', '/')
      api.get.mockResolvedValueOnce({ user: { id: 1, role: 'admin', email: 'admin@b.com' } })

      useAuthStore.getState().init()
      await vi.waitFor(() => expect(useAuthStore.getState().initializing).toBe(false))

      expect(useAuthStore.getState().user).toBeNull()
    })

    it('does adopt an admin identity when the tab is actually on the admin panel path', async () => {
      window.history.pushState({}, '', '/mgmt-8f2k1c/dashboard')
      api.get.mockResolvedValueOnce({ user: { id: 1, role: 'admin', email: 'admin@b.com' } })

      useAuthStore.getState().init()
      await vi.waitFor(() => expect(useAuthStore.getState().initializing).toBe(false))

      expect(useAuthStore.getState().user).toEqual({ id: 1, role: 'admin', email: 'admin@b.com' })
      window.history.pushState({}, '', '/')
    })
  })

  describe('login', () => {
    it('sets user and returns the response on a normal (non-2FA) login', async () => {
      api.post.mockResolvedValueOnce({ user: { id: 1, email: 'a@b.com' } })

      const data = await useAuthStore.getState().login('a@b.com', 'pw')

      expect(data).toEqual({ user: { id: 1, email: 'a@b.com' } })
      expect(useAuthStore.getState().user).toEqual({ id: 1, email: 'a@b.com' })
      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('does NOT set user yet when the response requires 2FA', async () => {
      api.post.mockResolvedValueOnce({ requires2fa: true, challengeId: 'chal_1' })

      const data = await useAuthStore.getState().login('a@b.com', 'pw')

      expect(data).toEqual({ requires2fa: true, challengeId: 'chal_1' })
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('sets loading true during the request and false after', async () => {
      let resolvePost
      api.post.mockReturnValueOnce(new Promise((resolve) => { resolvePost = resolve }))

      const promise = useAuthStore.getState().login('a@b.com', 'pw')
      expect(useAuthStore.getState().loading).toBe(true)

      resolvePost({ user: { id: 1 } })
      await promise

      expect(useAuthStore.getState().loading).toBe(false)
    })

    it('clears loading even when the request rejects, and rethrows', async () => {
      api.post.mockRejectedValueOnce(new Error('Invalid credentials'))

      await expect(useAuthStore.getState().login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials')

      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('posts to the admin-login endpoint when { admin: true } is passed', async () => {
      api.post.mockResolvedValueOnce({ user: { id: 1, role: 'admin' } })

      await useAuthStore.getState().login('admin@b.com', 'pw', { admin: true })

      expect(api.post).toHaveBeenCalledWith('/auth/admin-login', { email: 'admin@b.com', password: 'pw' })
    })

    it('posts to the regular login endpoint by default', async () => {
      api.post.mockResolvedValueOnce({ user: { id: 1 } })

      await useAuthStore.getState().login('a@b.com', 'pw')

      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pw' })
    })
  })

  describe('verifyTwoFactor', () => {
    it('sets user on successful verification and returns the user', async () => {
      api.post.mockResolvedValueOnce({ user: { id: 1, email: 'a@b.com' } })

      const user = await useAuthStore.getState().verifyTwoFactor('chal_1', '123456')

      expect(user).toEqual({ id: 1, email: 'a@b.com' })
      expect(useAuthStore.getState().user).toEqual({ id: 1, email: 'a@b.com' })
      expect(api.post).toHaveBeenCalledWith('/auth/2fa/verify', { challengeId: 'chal_1', token: '123456' })
    })

    it('clears loading and rethrows on an invalid code', async () => {
      api.post.mockRejectedValueOnce(new Error('Invalid code'))

      await expect(useAuthStore.getState().verifyTwoFactor('chal_1', '000000')).rejects.toThrow('Invalid code')

      expect(useAuthStore.getState().loading).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('register', () => {
    it('sets user on successful registration', async () => {
      api.post.mockResolvedValueOnce({ user: { id: 2, email: 'new@b.com' } })

      const user = await useAuthStore.getState().register('New', 'new@b.com', 'pw', '0300')

      expect(user).toEqual({ id: 2, email: 'new@b.com' })
      expect(useAuthStore.getState().user).toEqual({ id: 2, email: 'new@b.com' })
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'New',
        email: 'new@b.com',
        password: 'pw',
        phone: '0300',
      })
    })

    it('clears loading and rethrows on failure (e.g. email already taken)', async () => {
      api.post.mockRejectedValueOnce(new Error('Email already registered'))

      await expect(useAuthStore.getState().register('New', 'dup@b.com', 'pw', '0300')).rejects.toThrow(
        'Email already registered'
      )
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user synchronously, before the revoke request resolves', () => {
      useAuthStore.setState({ user: { id: 1 } })
      let resolvePost
      api.post.mockReturnValueOnce(new Promise((resolve) => { resolvePost = resolve }))

      useAuthStore.getState().logout()

      expect(useAuthStore.getState().user).toBeNull()
      resolvePost({})
    })

    it('calls the logout endpoint', () => {
      useAuthStore.setState({ user: { id: 1 } })
      api.post.mockResolvedValueOnce({})

      useAuthStore.getState().logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout', {})
    })

    it('logs but does not throw if the revoke request fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      useAuthStore.setState({ user: { id: 1 } })
      api.post.mockRejectedValueOnce(new Error('network error'))

      expect(() => useAuthStore.getState().logout()).not.toThrow()
      await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      consoleSpy.mockRestore()
    })
  })

  describe('updateSession', () => {
    it('replaces the user object directly (e.g. after a profile edit)', () => {
      useAuthStore.setState({ user: { id: 1, name: 'Old' } })

      useAuthStore.getState().updateSession({ id: 1, name: 'New' })

      expect(useAuthStore.getState().user).toEqual({ id: 1, name: 'New' })
    })
  })

  describe('useAuth compatibility hook', () => {
    it('derives isAdmin from user.role', () => {
      useAuthStore.setState({ user: { id: 1, role: 'admin' } })

      const { result } = renderHook(() => useAuth())

      expect(result.current.isAdmin).toBe(true)
      expect(result.current.user).toEqual({ id: 1, role: 'admin' })
    })

    it('isAdmin is false when there is no user or a non-admin role', () => {
      useAuthStore.setState({ user: null })
      expect(renderHook(() => useAuth()).result.current.isAdmin).toBe(false)

      useAuthStore.setState({ user: { id: 1, role: 'customer' } })
      expect(renderHook(() => useAuth()).result.current.isAdmin).toBe(false)
    })
  })
})
