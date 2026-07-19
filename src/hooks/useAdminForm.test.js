import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminSave, useAdminForm } from './useAdminForm'

describe('useAdminSave', () => {
  it('starts in a neutral, non-saving state', () => {
    const { result } = renderHook(() => useAdminSave())
    expect(result.current.saving).toBe(false)
    expect(result.current.saved).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('sets saving true during the action, then saved true on success', async () => {
    const { result } = renderHook(() => useAdminSave())
    let resolveAction
    const action = () => new Promise((resolve) => { resolveAction = resolve })

    let savePromise
    act(() => { savePromise = result.current.save(action) })
    expect(result.current.saving).toBe(true)
    expect(result.current.saved).toBe(false)

    await act(async () => {
      resolveAction()
      await savePromise
    })

    expect(result.current.saving).toBe(false)
    expect(result.current.saved).toBe(true)
    expect(result.current.error).toBe('')
  })

  it('sets error and leaves saved false when the action rejects', async () => {
    const { result } = renderHook(() => useAdminSave())

    await act(async () => {
      await result.current.save(() => Promise.reject(new Error('Validation failed')))
    })

    expect(result.current.saving).toBe(false)
    expect(result.current.saved).toBe(false)
    expect(result.current.error).toBe('Validation failed')
  })

  it('clears a previous error and saved flag at the start of a new save', async () => {
    const { result } = renderHook(() => useAdminSave())
    await act(async () => {
      await result.current.save(() => Promise.reject(new Error('first failure')))
    })
    expect(result.current.error).toBe('first failure')

    let resolveAction
    let savePromise
    act(() => {
      savePromise = result.current.save(() => new Promise((resolve) => { resolveAction = resolve }))
    })
    // error/saved should already be cleared while the new save is still in flight
    expect(result.current.error).toBe('')
    expect(result.current.saved).toBe(false)

    await act(async () => {
      resolveAction()
      await savePromise
    })
    expect(result.current.saved).toBe(true)
  })

  it('setSaved and setError expose manual control (e.g. dismissing a saved banner)', () => {
    const { result } = renderHook(() => useAdminSave())
    act(() => result.current.setSaved(true))
    expect(result.current.saved).toBe(true)
    act(() => result.current.setSaved(false))
    expect(result.current.saved).toBe(false)

    act(() => result.current.setError('manual error'))
    expect(result.current.error).toBe('manual error')
  })
})

describe('useAdminForm', () => {
  it('starts loading and calls load() once on mount', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAdminForm(load))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('sets error and clears loading if load() rejects', async () => {
    const load = vi.fn().mockRejectedValue(new Error('Failed to fetch'))
    const { result } = renderHook(() => useAdminForm(load))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to fetch')
  })

  it('reload() re-invokes load() and toggles loading around it', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAdminForm(load))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let resolveSecond
    load.mockReturnValueOnce(new Promise((resolve) => { resolveSecond = resolve }))
    act(() => { result.current.reload() })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolveSecond()
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('does not refetch in a loop — reload must be stable across renders when load is stable', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { result, rerender } = renderHook(() => useAdminForm(load))
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1))

    rerender()
    rerender()

    // Still just the one mount-time call — no infinite refetch loop from an unstable `load` ref.
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('exposes the save/saved/error state from useAdminSave alongside load state', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAdminForm(load))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save(() => Promise.resolve())
    })

    expect(result.current.saved).toBe(true)
  })

  it('a save error and a load error share the same error slot (last one wins)', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAdminForm(load))
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.save(() => Promise.reject(new Error('save failed')))
    })
    expect(result.current.error).toBe('save failed')
  })
})
