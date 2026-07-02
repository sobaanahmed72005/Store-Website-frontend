import { useEffect, useState } from 'react'
import { api } from '../../api/client'

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentMessage, setSentMessage] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/admin/newsletter', { auth: true })
      .then(setSubscribers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return
    try {
      await api.del(`/admin/newsletter/${id}`, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const activeSubscribers = subscribers.filter((s) => !s.unsubscribed_at)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    if (!window.confirm(`Send this email to all ${activeSubscribers.length} subscriber(s)?`)) return
    setSending(true)
    setError('')
    setSentMessage('')
    try {
      const data = await api.post('/admin/newsletter/send', { subject, message }, { auth: true })
      setSentMessage(`Sent to ${data.sent} subscriber(s).`)
      setSubject('')
      setMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Newsletter</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSend} className="flex flex-col gap-3 bg-white rounded-[10px] border border-[#dedede] p-5 mb-6 max-w-[640px]">
        <h2 className="text-[16px] font-semibold text-[#212121]">Send a Promo Email</h2>
        {sentMessage && <div className="text-[14px] text-green-700">{sentMessage}</div>}
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          required
          className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={5}
          required
          className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
        />
        <button
          type="submit"
          disabled={sending || activeSubscribers.length === 0}
          className="self-start rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
        >
          {sending ? 'Sending...' : `Send to ${activeSubscribers.length} Subscriber${activeSubscribers.length === 1 ? '' : 's'}`}
        </button>
      </form>

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Subscribed</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id} className="border-t border-[#dedede]">
                  <td className="px-4 py-3 text-[#212121]">{s.email}</td>
                  <td className="px-4 py-3 text-[#4b4b4b]">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {s.unsubscribed_at ? (
                      <span className="rounded-full bg-red-100 text-red-700 text-[12px] font-medium px-2.5 py-0.5">Unsubscribed</span>
                    ) : (
                      <span className="rounded-full bg-green-100 text-green-700 text-[12px] font-medium px-2.5 py-0.5">Subscribed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}