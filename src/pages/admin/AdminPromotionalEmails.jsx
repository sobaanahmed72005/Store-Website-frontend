import { useEffect, useRef, useState } from 'react'
import { api, uploadImage, resolveImageUrl } from '../../api/client'

const emptyForm = { title: '', subject: '', message: '', poster_image: null }

const STATUS_STYLE = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-green-100 text-green-700',
}

export default function AdminPromotionalEmails() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const posterInputRef = useRef(null)

  const loadEmails = () => {
    setLoading(true)
    api.get('/admin/promo-emails', { auth: true })
      .then(setEmails)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEmails() }, [])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setSuccessMsg('')
    setShowForm(true)
  }

  const openEdit = (email) => {
    setEditingId(email.id)
    setForm({
      title: email.title,
      subject: email.subject,
      message: email.message,
      poster_image: email.poster_image || null,
    })
    setError('')
    setSuccessMsg('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setError('')
    setSuccessMsg('')
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSuccessMsg('')
  }

  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPoster(true)
    setError('')
    try {
      const data = await uploadImage(file)
      setForm((prev) => ({ ...prev, poster_image: data.url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingPoster(false)
      if (posterInputRef.current) posterInputRef.current.value = ''
    }
  }

  const saveEmail = async () => {
    if (!form.title.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Title, subject and message are required')
      return null
    }
    setError('')
    setSaving(true)
    try {
      let saved
      if (editingId) {
        saved = await api.put(`/admin/promo-emails/${editingId}`, form, { auth: true })
      } else {
        saved = await api.post('/admin/promo-emails', form, { auth: true })
        setEditingId(saved.id)
      }
      loadEmails()
      return saved
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    const saved = await saveEmail()
    if (saved) setSuccessMsg('Saved as draft.')
  }

  const handleSend = async () => {
    const saved = await saveEmail()
    if (!saved) return
    setSending(true)
    setError('')
    try {
      const result = await api.post(`/admin/promo-emails/${saved.id}/send`, {}, { auth: true })
      setSuccessMsg(`Sent to ${result.recipients} subscriber${result.recipients === 1 ? '' : 's'}.`)
      loadEmails()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this promotional email?')) return
    try {
      await api.del(`/admin/promo-emails/${id}`, { auth: true })
      if (editingId === id) handleCancel()
      loadEmails()
    } catch (err) {
      setError(err.message)
    }
  }

  const isActing = saving || sending

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-[22px] font-semibold text-[#212121]">Promotional Emails</h1>
          <p className="text-[13px] text-[#4b4b4b] mt-0.5">
            Write promotional emails with a custom poster, subject and message. Send to all newsletter subscribers with one click.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-4 py-2.5 transition-colors whitespace-nowrap"
          >
            + New Email
          </button>
        )}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="mt-6 bg-white rounded-[10px] border border-[#dedede] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-semibold text-[#212121]">
              {editingId ? 'Edit Promotional Email' : 'New Promotional Email'}
            </h2>
            <button type="button" onClick={handleCancel} className="text-[13px] text-[#888] hover:text-[#212121]">
              Cancel
            </button>
          </div>

          {error && <div className="text-[13px] text-red-600 mb-4">{error}</div>}

          <div className="space-y-5">
            {/* Internal title */}
            <div>
              <label className="block text-[13px] font-medium text-[#212121] mb-1.5">
                Internal Title{' '}
                <span className="font-normal text-[#888]">(not shown in email — for your reference only)</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Eid Sale 2025"
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[13px] font-medium text-[#212121] mb-1.5">
                Email Subject & Headline
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g. 🎉 Eid Sale — Up to 40% Off on Laptops!"
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
              <p className="text-[12px] text-[#888] mt-1">
                Used as both the email subject line and the headline displayed inside the email.
              </p>
            </div>

            {/* Poster image */}
            <div>
              <label className="block text-[13px] font-medium text-[#212121] mb-1.5">
                Poster Image <span className="font-normal text-[#888]">(optional — shown at the top of the email)</span>
              </label>
              {form.poster_image ? (
                <div>
                  <img
                    src={resolveImageUrl(form.poster_image)}
                    alt="Poster preview"
                    className="max-h-[200px] w-full object-cover rounded-[8px] border border-[#dedede]"
                  />
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      className="text-[13px] text-cz-primary font-medium hover:underline"
                    >
                      Change image
                    </button>
                    <span className="text-[#ccc]">|</span>
                    <button
                      type="button"
                      onClick={() => handleChange('poster_image', null)}
                      className="text-[13px] text-red-600 font-medium hover:underline"
                    >
                      Remove poster
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-[#d1d5db] rounded-[8px] py-10 text-center cursor-pointer hover:border-cz-primary transition-colors"
                  onClick={() => !uploadingPoster && posterInputRef.current?.click()}
                >
                  {uploadingPoster ? (
                    <p className="text-[13px] text-[#4b4b4b]">Uploading...</p>
                  ) : (
                    <>
                      <p className="text-[14px] font-medium text-[#212121]">Click to upload a poster image</p>
                      <p className="text-[12px] text-[#888] mt-1">JPG, PNG or WebP — displayed full-width at the top of the email</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={posterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterUpload}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[13px] font-medium text-[#212121] mb-1.5">Message</label>
              <textarea
                rows={7}
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Write your promotional message here. Each paragraph on a new line."
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-y"
              />
              <p className="text-[12px] text-[#888] mt-1">
                Plain text only. Start a new line for a new paragraph. Email branding and design are applied automatically.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="mt-4 rounded-[8px] bg-green-50 border border-green-200 px-4 py-3 text-[13px] font-medium text-green-700">
              {successMsg}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={handleSend}
              disabled={isActing}
              className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
            >
              {sending ? 'Sending...' : editingId ? 'Save & Send to Subscribers' : 'Send to All Subscribers'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isActing}
              className="rounded-md border border-[#d1d5db] text-[#212121] hover:bg-[#f9f9f9] text-[14px] font-medium px-4 py-2.5 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Past campaigns */}
      <div className={`${showForm ? 'mt-6' : 'mt-5'} bg-white rounded-[10px] border border-[#dedede] overflow-hidden`}>
        <div className="px-5 py-3.5 border-b border-[#f0f0f0] bg-cz-gold-light flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#212121]">Past Campaigns</span>
          {!showForm && (
            <button type="button" onClick={openNew} className="text-[13px] text-cz-primary font-medium hover:underline">
              + New
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-5 py-10 text-[13px] text-[#4b4b4b] text-center">Loading...</div>
        ) : emails.length === 0 ? (
          <div className="px-5 py-10 text-[13px] text-[#4b4b4b] text-center">
            No promotional emails yet. Create your first one above.
          </div>
        ) : (
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left border-b border-[#f0f0f0]">
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]">Title</th>
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]">Subject</th>
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]">Poster</th>
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]">Status</th>
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]">Sent On</th>
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]">Recipients</th>
                <th className="px-5 py-3 text-[13px] font-medium text-[#4b4b4b]" />
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id} className="border-t border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-5 py-3 text-[#212121] font-medium">{email.title}</td>
                  <td className="px-5 py-3 text-[#4b4b4b] max-w-[200px]">
                    <span className="block truncate">{email.subject}</span>
                  </td>
                  <td className="px-5 py-3">
                    {email.poster_image ? (
                      <img
                        src={resolveImageUrl(email.poster_image)}
                        alt=""
                        className="h-[36px] w-[60px] rounded object-cover border border-[#f0f0f0]"
                      />
                    ) : (
                      <span className="text-[#ccc] text-[12px]">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full text-[11px] font-semibold px-2.5 py-1 ${STATUS_STYLE[email.status] || ''}`}>
                      {email.status === 'sent' ? 'Sent' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#4b4b4b] whitespace-nowrap">
                    {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-[#4b4b4b]">
                    {email.status === 'sent' ? email.recipient_count.toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(email)}
                        className="text-[13px] text-cz-primary font-medium hover:underline"
                      >
                        {email.status === 'sent' ? 'Edit & Resend' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(email.id, e)}
                        className="text-[13px] text-red-600 font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}