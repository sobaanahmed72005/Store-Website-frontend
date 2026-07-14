import { useCallback, useEffect, useState } from 'react'

// Captures the saving/saved/error boilerplate around a PUT/POST action, hand-copied across every
// admin page that saves something — including a few (branding, account details, password) whose
// initial values come from context/props rather than a fetch, so they only ever need this half.
export function useAdminSave() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const save = useCallback(async (action) => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await action()
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [])

  return { saving, saved, setSaved, error, setError, save }
}

// Adds the load/loading half on top of useAdminSave: fetch once on mount (or on demand via the
// returned `reload`) into `loading`. `error` is shared between load and save, same as the
// original hand-written versions — one error banner covers whichever failed most recently. Pages
// that only load a list (no page-level save action) can just ignore `saving`/`saved`/`save`.
//
// `load` must be stable (wrap it in useCallback at the call site) — it's a dependency of the
// mount effect, so a new reference on every render would refetch in a loop.
export function useAdminForm(load) {
  const [loading, setLoading] = useState(true)
  const { saving, saved, setSaved, error, setError, save } = useAdminSave()

  const reload = useCallback(() => {
    setLoading(true)
    return load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [load, setError])

  useEffect(() => {
    reload()
  }, [reload])

  return { loading, saving, saved, setSaved, error, setError, save, reload }
}
