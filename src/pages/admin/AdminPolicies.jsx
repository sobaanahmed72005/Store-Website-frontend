import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const emptyContent = {
  pageTitle: '',
  sections: [{ heading: '', body: '' }],
}

export default function AdminPolicies() {
  const [content, setContent] = useState(emptyContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get('/content/policies')
      .then((data) =>
        setContent({
          pageTitle: data.pageTitle ?? '',
          sections: data.sections?.length ? data.sections : [{ heading: '', body: '' }],
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const updateSection = (i, field, value) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }))
  }
  const addSection = () =>
    setContent((prev) => ({ ...prev, sections: [...prev.sections, { heading: '', body: '' }] }))
  const removeSection = (i) =>
    setContent((prev) => ({ ...prev, sections: prev.sections.filter((_, idx) => idx !== i) }))
  const moveSection = (i, dir) => {
    setContent((prev) => {
      const next = [...prev.sections]
      const target = i + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[i], next[target]] = [next[target], next[i]]
      return { ...prev, sections: next }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const payload = {
        pageTitle: content.pageTitle,
        sections: content.sections.filter((s) => s.heading.trim() !== ''),
      }
      await api.put('/admin/content/policies', payload, { auth: true })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[760px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Policies Page</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved. Refresh the Return &amp; Exchange page to see it live.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6">
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Page Title</label>
          <input
            value={content.pageTitle}
            onChange={(e) => setContent((prev) => ({ ...prev, pageTitle: e.target.value }))}
            className="w-full max-w-[420px] rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-4">Policy Sections</h2>
          <div className="flex flex-col gap-4">
            {content.sections.map((section, i) => (
              <div key={i} className="border border-[#dedede] rounded-md p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] text-[#4b4b4b]">Section {i + 1}</label>
                  <div className="flex items-center gap-3 text-[13px]">
                    <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} className="text-cz-primary hover:underline disabled:opacity-30 disabled:no-underline">
                      Move Up
                    </button>
                    <button type="button" onClick={() => moveSection(i, 1)} disabled={i === content.sections.length - 1} className="text-cz-primary hover:underline disabled:opacity-30 disabled:no-underline">
                      Move Down
                    </button>
                    <button type="button" onClick={() => removeSection(i)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
                <input
                  placeholder="Heading"
                  value={section.heading}
                  onChange={(e) => updateSection(i, 'heading', e.target.value)}
                  className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                />
                <textarea
                  placeholder="Body text"
                  value={section.body}
                  onChange={(e) => updateSection(i, 'body', e.target.value)}
                  rows={3}
                  className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={addSection} className="mt-3 text-cz-primary hover:underline text-[13px]">
            + Add Policy Section
          </button>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
