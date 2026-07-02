import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const emptyContent = {
  paragraphs: [''],
  highlights: [{ title: '', description: '' }],
  storeAddress: '',
  storeTimings: '',
}

export default function AdminAboutUs() {
  const [content, setContent] = useState(emptyContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get('/content/about-us')
      .then((data) =>
        setContent({
          paragraphs: data.paragraphs?.length ? data.paragraphs : [''],
          highlights: data.highlights?.length ? data.highlights : [{ title: '', description: '' }],
          storeAddress: data.storeAddress ?? '',
          storeTimings: data.storeTimings ?? '',
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const updateParagraph = (i, value) => {
    setContent((prev) => ({ ...prev, paragraphs: prev.paragraphs.map((p, idx) => (idx === i ? value : p)) }))
  }
  const addParagraph = () => setContent((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ''] }))
  const removeParagraph = (i) =>
    setContent((prev) => ({ ...prev, paragraphs: prev.paragraphs.filter((_, idx) => idx !== i) }))

  const updateHighlight = (i, field, value) => {
    setContent((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)),
    }))
  }
  const addHighlight = () =>
    setContent((prev) => ({ ...prev, highlights: [...prev.highlights, { title: '', description: '' }] }))
  const removeHighlight = (i) =>
    setContent((prev) => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const payload = {
        paragraphs: content.paragraphs.filter((p) => p.trim() !== ''),
        highlights: content.highlights.filter((h) => h.title.trim() !== ''),
        storeAddress: content.storeAddress,
        storeTimings: content.storeTimings,
      }
      await api.put('/admin/content/about-us', payload, { auth: true })
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
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">About Us Page</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved. Refresh the About Us page to see it live.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-4">Intro Paragraphs</h2>
          <div className="flex flex-col gap-3">
            {content.paragraphs.map((para, i) => (
              <div key={i} className="flex gap-2 items-start">
                <textarea
                  value={para}
                  onChange={(e) => updateParagraph(i, e.target.value)}
                  rows={3}
                  className="flex-1 rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeParagraph(i)}
                  className="text-red-600 hover:underline text-[13px] mt-2.5"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addParagraph} className="mt-3 text-cz-primary hover:underline text-[13px]">
            + Add Paragraph
          </button>
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-4">Highlight Cards</h2>
          <div className="flex flex-col gap-4">
            {content.highlights.map((item, i) => (
              <div key={i} className="border border-[#dedede] rounded-md p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] text-[#4b4b4b]">Card {i + 1}</label>
                  <button type="button" onClick={() => removeHighlight(i)} className="text-red-600 hover:underline text-[13px]">
                    Remove
                  </button>
                </div>
                <input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => updateHighlight(i, 'title', e.target.value)}
                  className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                />
                <textarea
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateHighlight(i, 'description', e.target.value)}
                  rows={2}
                  className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={addHighlight} className="mt-3 text-cz-primary hover:underline text-[13px]">
            + Add Card
          </button>
        </div>

        <div className="bg-white rounded-[10px] border border-[#dedede] p-6">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-4">Visit Our Store</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Store Address</label>
              <input
                value={content.storeAddress}
                onChange={(e) => setContent((prev) => ({ ...prev, storeAddress: e.target.value }))}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Store Timings</label>
              <input
                value={content.storeTimings}
                onChange={(e) => setContent((prev) => ({ ...prev, storeTimings: e.target.value }))}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
          </div>
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
