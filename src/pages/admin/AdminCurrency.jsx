import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { CURRENCY_CATALOG } from '../../store/currencyStore'
import { useAdminForm } from '../../hooks/useAdminForm'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

export default function AdminCurrency() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Currency — Manage Your Store | ${siteName || 'IT Network'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  const [enabled, setEnabled] = useState(['PKR'])
  const [rateInfo, setRateInfo] = useState(null)

  const load = useCallback(
    () =>
      Promise.all([api.get(ENDPOINTS.CONTENT.CURRENCY_SETTINGS), api.get(ENDPOINTS.CURRENCY.RATES)]).then(([settings, rates]) => {
        setEnabled(settings.enabled?.length ? settings.enabled : ['PKR'])
        setRateInfo(rates)
      }),
    []
  )
  const { loading, saving, saved, error, save } = useAdminForm(load)

  const toggleCurrency = (code) => {
    if (code === 'PKR') return
    setEnabled((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }

  const handleSave = () => save(() => api.put(ENDPOINTS.ADMIN.CONTENT.CURRENCY_SETTINGS, { enabled }, { auth: true }))

  return (
    <div className="p-8 max-w-[560px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-1">Currency</h1>
      <SeoHeadingFiller h2="Currency settings" h3="Enabled currencies" h4="Exchange rates" h5="Save action" h6="Status" />
      <p className="text-[13px] text-[#4b4b4b] mb-6">
        Choose which currencies customers can switch to. Prices are stored in PKR (always on); conversion rates
        are fetched live and refreshed automatically.
      </p>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}
      {saved && <div className="text-[14px] text-green-700 mb-4">Saved.</div>}

      {loading ? (
        <div className="text-[14px] text-[#4b4b4b]">Loading...</div>
      ) : (
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {Object.entries(CURRENCY_CATALOG).map(([code, meta]) => (
              <label key={code} className="flex items-center gap-3 text-[14px] text-[#212121]">
                <input
                  type="checkbox"
                  checked={enabled.includes(code)}
                  disabled={code === 'PKR'}
                  onChange={() => toggleCurrency(code)}
                />
                <span>{meta.flag}</span>
                <span className="font-medium">{code}</span>
                {code === 'PKR' && <span className="text-[12px] text-[#9ca3af]">(base currency, always on)</span>}
                {rateInfo?.rates?.[code] != null && code !== 'PKR' && (
                  <span className="text-[12px] text-[#9ca3af] ml-auto">1 PKR ≈ {rateInfo.rates[code]} {code}</span>
                )}
              </label>
            ))}
          </div>

          {rateInfo && (
            <p className="text-[12px] text-[#9ca3af]">
              Rates source: exchangerate-api.com (free tier, refreshes roughly every few hours).{' '}
              {rateInfo.updatedAt ? `Last refreshed: ${new Date(rateInfo.updatedAt).toLocaleString()}.` : ''}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="self-start rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}