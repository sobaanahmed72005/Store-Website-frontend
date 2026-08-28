import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useAdminForm } from '../../hooks/useAdminForm'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

const emptyForm = {
  provider: 'Leopards Courier',
  enabled: false,
  tracking_url_template: 'https://pk.leopardscourier.com/tracking#{tracking_number}',
  sandbox: true,
  default_weight_grams: 1000,
  origin_city: 'self',
  shipper_id: '',
  shippers: [],
  has_api_key: false,
  has_api_password: false,
}

export default function AdminCourier() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Courier — Manage Your Store | ${siteName || 'IT Solutions'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  const [form, setForm] = useState(emptyForm)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiPasswordInput, setApiPasswordInput] = useState('')
  const [newShipperId, setNewShipperId] = useState('')
  const [newShipperName, setNewShipperName] = useState('')
  const [newShipperCity, setNewShipperCity] = useState('')
  const [newShipperPhone, setNewShipperPhone] = useState('')
  const [newShipperAddress, setNewShipperAddress] = useState('')
  const [newShipperReturnAddress, setNewShipperReturnAddress] = useState('')
  const [editingShipperId, setEditingShipperId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const load = useCallback(
    () => api.get(ENDPOINTS.ADMIN.COURIER_SETTINGS.BASE, { auth: true }).then((data) => setForm({ ...emptyForm, ...data })),
    []
  )
  const { loading, saving, saved, error, setError, save } = useAdminForm(load)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleAddShipper = () => {
    if (!newShipperId.trim()) return
    const id = newShipperId.trim()
    const name = newShipperName.trim() || `Shipper ${id}`
    const origin_city = newShipperCity.trim()
    const phone = newShipperPhone.trim()
    const address = newShipperAddress.trim()
    const return_address = newShipperReturnAddress.trim() || address

    const existing = form.shippers || []
    if (existing.some((s) => s.id === id)) return
    const updated = [...existing, { id, name, origin_city, phone, address, return_address }]
    setForm((prev) => ({
      ...prev,
      shippers: updated,
    }))
    setNewShipperId('')
    setNewShipperName('')
    setNewShipperCity('')
    setNewShipperPhone('')
    setNewShipperAddress('')
    setNewShipperReturnAddress('')
  }

  const handleStartEditShipper = (shipper) => {
    setEditingShipperId(shipper.id)
    setEditDraft({ ...shipper })
  }

  const handleCancelEditShipper = () => {
    setEditingShipperId(null)
    setEditDraft(null)
  }

  const handleSaveEditShipper = () => {
    if (!editDraft || !editDraft.id.trim()) return
    const updated = (form.shippers || []).map((s) =>
      s.id === editingShipperId
        ? {
            id: editDraft.id.trim(),
            name: editDraft.name.trim() || `Shipper ${editDraft.id}`,
            origin_city: (editDraft.origin_city || '').trim(),
            phone: (editDraft.phone || '').trim(),
            address: (editDraft.address || '').trim(),
            return_address: (editDraft.return_address || '').trim(),
          }
        : s
    )
    setForm((prev) => ({
      ...prev,
      shippers: updated,
      shipper_id: prev.shipper_id === editingShipperId ? editDraft.id.trim() : prev.shipper_id,
    }))
    setEditingShipperId(null)
    setEditDraft(null)
  }

  const handleRemoveShipper = (idToRemove) => {
    const updated = (form.shippers || []).filter((s) => s.id !== idToRemove)
    setForm((prev) => ({
      ...prev,
      shippers: updated,
      shipper_id: prev.shipper_id === idToRemove ? '' : prev.shipper_id,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTestResult(null)
    save(async () => {
      await api.put(
        ENDPOINTS.ADMIN.COURIER_SETTINGS.BASE,
        { ...form, api_key: apiKeyInput || undefined, api_password: apiPasswordInput || undefined },
        { auth: true }
      )
      setApiKeyInput('')
      setApiPasswordInput('')
      // Re-fetches the has_api_key/has_api_password flags without flipping the page-level
      // `loading` flag back on — the form is already visible, this just refreshes it in place.
      await load()
    })
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setError('')
    setTestResult(null)
    try {
      const result = await api.post(ENDPOINTS.ADMIN.COURIER_SETTINGS.TEST, {}, { auth: true })
      setTestResult(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  const isLeopards = /leopards/i.test(form.provider || '')

  return (
    <div className="p-8 max-w-[560px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Courier</h1>
      <SeoHeadingFiller h2="Courier settings" h3="Credentials" h4="Tracking" h5="Test connection" h6="Save action" />
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Once enabled, orders are auto-booked with Leopards the moment you mark them Shipped, and this store checks
        Leopards for live status updates every 15 minutes — advancing order status automatically as your package moves.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved.</div>}
      {testResult && <div className="text-[14px] text-green-700 mb-4">{testResult}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Courier</label>
          <input
            name="provider"
            value={form.provider}
            onChange={handleChange}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>

        <label className="flex items-center gap-2 text-[14px] text-[#212121]">
          <input type="checkbox" name="enabled" checked={form.enabled} onChange={handleChange} />
          Enable automated booking + live tracking sync
        </label>

        <label className={`flex items-center gap-2 text-[13px] rounded-md px-3 py-2.5 border ${form.sandbox ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-red-300 bg-red-50 text-red-800'}`}>
          <input type="checkbox" name="sandbox" checked={form.sandbox} onChange={handleChange} />
          Sandbox / staging mode {form.sandbox ? '(safe — no real shipments booked)' : '(LIVE — real pickups & charges will occur)'}
        </label>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">
            API Key {form.has_api_key && <span className="text-green-700">(saved)</span>}
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={form.has_api_key ? 'Leave blank to keep existing key' : 'Paste once Leopards gives you API access'}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
          />
        </div>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">
            API Password {form.has_api_password && <span className="text-green-700">(saved)</span>}
          </label>
          <input
            type="password"
            value={apiPasswordInput}
            onChange={(e) => setApiPasswordInput(e.target.value)}
            placeholder={form.has_api_password ? 'Leave blank to keep existing password' : 'Enter your Leopards API password'}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary font-mono"
          />
        </div>

        {isLeopards && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[#4b4b4b] mb-1">Default Package Weight (grams)</label>
                <input
                  name="default_weight_grams"
                  type="number"
                  min="1"
                  value={form.default_weight_grams}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                />
              </div>
              <div>
                <label className="block text-[13px] text-[#4b4b4b] mb-1">Origin City</label>
                <input
                  name="origin_city"
                  value={form.origin_city}
                  onChange={handleChange}
                  placeholder="self"
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
                />
                <p className="text-[12px] text-[#9ca3af] mt-1">Leave as "self" to use your registered shipper city.</p>
              </div>
            </div>

            <div className="border border-[#dedede] rounded-md p-4 bg-[#f9fafb]">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[13px] font-medium text-[#212121]">Registered Shippers (Multi-Shipper Accounts)</label>
                {form.shipper_id && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, shipper_id: '' }))}
                    className="text-[12px] text-amber-700 hover:underline"
                  >
                    Clear Default (Require Selection on Every Order)
                  </button>
                )}
              </div>
              <p className="text-[12px] text-[#6b7280] mb-3">Add your Leopards Shipper profiles with exact city, address, phone, and return details. If no default is selected, you will choose the shipper for each order.</p>

              {(form.shippers || []).length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {form.shippers.map((shipper) => (
                    <div key={shipper.id} className="bg-white border border-[#d1d5db] rounded-md p-3 text-[13px]">
                      {editingShipperId === shipper.id ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2">
                            <span className="font-semibold text-[#212121]">Edit Shipper Profile</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSaveEditShipper}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[12px] font-medium"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditShipper}
                                className="px-3 py-1 border border-[#d1d5db] hover:bg-gray-100 text-[#4b4b4b] rounded text-[12px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            <div>
                              <label className="block text-[11px] text-[#6b7280]">Shipper ID / AC</label>
                              <input
                                value={editDraft.id}
                                onChange={(e) => setEditDraft((prev) => ({ ...prev, id: e.target.value }))}
                                className="w-full rounded border border-[#d1d5db] text-[12px] px-2.5 py-1.5 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#6b7280]">Shipper / Vendor Name</label>
                              <input
                                value={editDraft.name}
                                onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full rounded border border-[#d1d5db] text-[12px] px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#6b7280]">Origin City</label>
                              <input
                                value={editDraft.origin_city || ''}
                                onChange={(e) => setEditDraft((prev) => ({ ...prev, origin_city: e.target.value }))}
                                className="w-full rounded border border-[#d1d5db] text-[12px] px-2.5 py-1.5"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-[#6b7280]">Contact Phone</label>
                              <input
                                value={editDraft.phone || ''}
                                onChange={(e) => setEditDraft((prev) => ({ ...prev, phone: e.target.value }))}
                                className="w-full rounded border border-[#d1d5db] text-[12px] px-2.5 py-1.5"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] text-[#6b7280]">Pickup Address</label>
                              <input
                                value={editDraft.address || ''}
                                onChange={(e) => setEditDraft((prev) => ({ ...prev, address: e.target.value }))}
                                className="w-full rounded border border-[#d1d5db] text-[12px] px-2.5 py-1.5"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] text-[#6b7280]">Return Address</label>
                              <input
                                value={editDraft.return_address || ''}
                                onChange={(e) => setEditDraft((prev) => ({ ...prev, return_address: e.target.value }))}
                                className="w-full rounded border border-[#d1d5db] text-[12px] px-2.5 py-1.5"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-2 mb-2">
                            <div>
                              <span className="font-semibold text-[#212121]">{shipper.name}</span>
                              <span className="ml-2 text-[#6b7280] font-mono">(ID: {shipper.id})</span>
                              {form.shipper_id === shipper.id ? (
                                <span className="ml-2 bg-green-100 text-green-800 text-[11px] font-medium px-2 py-0.5 rounded">Default Shipper</span>
                              ) : (
                                <span className="ml-2 text-[11px] text-[#888]">(No Default)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {form.shipper_id !== shipper.id ? (
                                <button
                                  type="button"
                                  onClick={() => setForm((prev) => ({ ...prev, shipper_id: shipper.id }))}
                                  className="text-cz-primary text-[12px] font-medium hover:underline"
                                >
                                  Make Default
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setForm((prev) => ({ ...prev, shipper_id: '' }))}
                                  className="text-gray-500 text-[12px] hover:underline"
                                >
                                  Unset Default
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleStartEditShipper(shipper)}
                                className="text-blue-600 text-[12px] font-medium hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveShipper(shipper.id)}
                                className="text-red-600 text-[12px] hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-[#4b4b4b]">
                            <div><span className="text-[#888]">Origin City:</span> {shipper.origin_city || shipper.city || 'Self / Registered'}</div>
                            <div><span className="text-[#888]">Phone:</span> {shipper.phone || 'N/A'}</div>
                            <div className="sm:col-span-2"><span className="text-[#888]">Pickup Address:</span> {shipper.address || 'N/A'}</div>
                            <div className="sm:col-span-2"><span className="text-[#888]">Return Address:</span> {shipper.return_address || shipper.address || 'N/A'}</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white border border-[#d1d5db] rounded-md p-3 flex flex-col gap-2">
                <div className="text-[13px] font-medium text-[#212121]">Add New Shipper Profile</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    value={newShipperId}
                    onChange={(e) => setNewShipperId(e.target.value)}
                    placeholder="Shipper AC / ID (e.g. 232478)"
                    className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary font-mono"
                  />
                  <input
                    value={newShipperName}
                    onChange={(e) => setNewShipperName(e.target.value)}
                    placeholder="Shipper / Vendor Name (e.g. NABEEL IRSHAD)"
                    className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary"
                  />
                  <input
                    value={newShipperCity}
                    onChange={(e) => setNewShipperCity(e.target.value)}
                    placeholder="Origin City (e.g. BUREWALA)"
                    className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary"
                  />
                  <input
                    value={newShipperPhone}
                    onChange={(e) => setNewShipperPhone(e.target.value)}
                    placeholder="Contact Phone (e.g. 03006939443)"
                    className="rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary"
                  />
                  <input
                    value={newShipperAddress}
                    onChange={(e) => setNewShipperAddress(e.target.value)}
                    placeholder="Shipper Address (e.g. OFFICE # 61, MULTAN ROAD, BUREWALA)"
                    className="sm:col-span-2 rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary"
                  />
                  <input
                    value={newShipperReturnAddress}
                    onChange={(e) => setNewShipperReturnAddress(e.target.value)}
                    placeholder="Return Address (Optional, defaults to Shipper Address)"
                    className="sm:col-span-2 rounded-md border border-[#d1d5db] text-[13px] px-3 py-2 outline-none focus:border-cz-primary"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleAddShipper}
                    className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[13px] px-4 py-2 font-medium"
                  >
                    + Save Shipper Profile
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !form.has_api_key || !form.has_api_password}
                className="rounded-md border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[13px] font-medium px-4 py-2 transition-colors disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <p className="text-[12px] text-[#9ca3af] mt-1">
                Save your credentials first, then test — this checks the saved credentials against Leopards without booking anything.
              </p>
            </div>
          </>
        )}

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Tracking URL Template</label>
          <input
            name="tracking_url_template"
            value={form.tracking_url_template}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
          <p className="text-[12px] text-[#9ca3af] mt-1">
            Must include <code>{'{tracking_number}'}</code>. This builds the "Track Package" link shown to customers.
          </p>
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
