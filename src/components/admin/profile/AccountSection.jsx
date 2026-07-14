import { useState } from 'react'
import { api } from '../../../api/client'
import { useAuth } from '../../../context/AuthContext'
import { useAdminSave } from '../../../hooks/useAdminForm'

export default function AccountSection() {
  const { user, updateSession } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const { saving, saved, error, save } = useAdminSave()

  const handleSubmit = (e) => {
    e.preventDefault()
    save(async () => {
      const data = await api.put('/auth/me', { name, email }, { auth: true })
      updateSession(data.user)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-[#212121]">Account Details</h2>
      {error && <div className="text-[14px] text-red-600">{error}</div>}
      {saved && <div className="text-[14px] text-green-700">Saved.</div>}

      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
      </div>

      <div>
        <label className="block text-[13px] text-[#4b4b4b] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
        />
        <p className="text-[12px] text-[#9ca3af] mt-1">This is also your login email for this admin panel.</p>
      </div>

      <div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Account Details'}
        </button>
      </div>
    </form>
  )
}
