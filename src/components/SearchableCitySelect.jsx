import { useEffect, useState } from 'react'
import { ChevronDownIcon } from './icons'

export const LEOPARDS_PAKISTAN_CITIES = [
  'Abbottabad', 'Ahmedpur East', 'Ali Pur Chatta', 'Arifwala', 'Attock',
  'Badin', 'Bahawalnagar', 'Bahawalpur', 'Bannu', 'Batten',
  'Bhai Pheru', 'Bhakkar', 'Bhalwal', 'Bhimber', 'Burewala',
  'Chakwal', 'Chaman', 'Charsadda', 'Chichawatni', 'Chiniot',
  'Chishtian', 'Chitral', 'Chunian', 'Dadu', 'Daska',
  'Dera Ghazi Khan', 'Dera Ismail Khan', 'Dina', 'Faisalabad',
  'Fateh Jang', 'Gojra', 'Gujar Khan', 'Gujranwala', 'Gujrat',
  'Hafizabad', 'Hangu', 'Haripur', 'Haroonabad', 'Hasan Abdal',
  'Hasilpur', 'Haveli Lakha', 'Hub', 'Hyderabad', 'Islamabad',
  'Jacobabad', 'Jalalpur Jattan', 'Jampur', 'Jang', 'Jhelum',
  'Kabal', 'Kabirwala', 'Kahuta', 'Kallarkahar', 'Kamalia',
  'Kamber Ali Khan', 'Kamoke', 'Kandhkot', 'Karachi', 'Karak',
  'Kashmore', 'Kasur', 'Khairpur', 'Khanewal', 'Khanpur',
  'Kharian', 'Khushab', 'Khuzdar', 'Kohat', 'Kot Addu',
  'Kotli', 'Kotri', 'Lahore', 'Lalamusa', 'Larkana',
  'Layyah', 'Liaquatpur', 'Lodhran', 'Mandi Bahauddin', 'Mansehra',
  'Mardan', 'Mian Channu', 'Mianwali', 'Mingora (Swat)', 'Mirpur (AJK)',
  'Mirpur Khas', 'Multan', 'Muridke', 'Murree', 'Muzaffarabad',
  'Muzaffargarh', 'Nankana Sahib', 'Narowal', 'Nawabshah (Shaheed Benazirabad)', 'Nowshera',
  'Okara', 'Pakpattan', 'Pattoki', 'Peshawar', 'Pishin',
  'Quetta', 'Rahim Yar Khan', 'Raiwind', 'Rajanpur', 'Rawalpindi',
  'Renala Khurd', 'Sadiqabad', 'Sahiwal', 'Sambrial', 'Samundri',
  'Sargodha', 'Shahkot', 'Sheikhupura', 'Shikarpur', 'Shorkot',
  'Sialkot', 'Sukkur', 'Swabi', 'Tando Adam', 'Tando Allahyar',
  'Taxila', 'Toba Tek Singh', 'Turbat', 'Umerkot', 'Vehari',
  'Wah Cantt', 'Wazirabad', 'Zhob', 'Ziarat',
]

export default function SearchableCitySelect({ value, onChange, label = 'City *' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOther, setIsOther] = useState(false)
  const [customCity, setCustomCity] = useState('')

  useEffect(() => {
    if (!value) return
    const match = LEOPARDS_PAKISTAN_CITIES.find(
      (c) => c.toLowerCase() === value.trim().toLowerCase()
    )
    if (match) {
      setIsOther(false)
    } else if (value.trim()) {
      setIsOther(true)
      setCustomCity(value)
    }
  }, [value])

  const filteredCities = LEOPARDS_PAKISTAN_CITIES.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const handleSelectCity = (cityName) => {
    setIsOther(false)
    setSearchTerm('')
    setIsOpen(false)
    onChange(cityName)
  }

  const handleSelectOther = () => {
    setIsOther(true)
    setIsOpen(false)
    onChange(customCity)
  }

  const handleCustomCityChange = (e) => {
    const val = e.target.value
    setCustomCity(val)
    onChange(val)
  }

  return (
    <div className="relative flex flex-col gap-1.5 w-full">
      {label && <label className="block text-[13px] font-semibold text-slate-700">{label}</label>}

      {/* Select Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all text-left cursor-pointer"
        >
          <span className={!value && !isOther ? 'text-slate-400' : 'text-slate-800 font-medium'}>
            {isOther ? 'Other (Enter manually below)' : value || 'Select or search your city'}
          </span>
          <ChevronDownIcon size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 max-h-[300px] flex flex-col">
            <input
              type="text"
              placeholder="🔍 Type city name to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 text-[13px] px-3 py-2 outline-none focus:border-cz-primary mb-2"
              autoFocus
            />
            <div className="overflow-y-auto flex-1 flex flex-col gap-0.5 pr-1">
              <button
                type="button"
                onClick={handleSelectOther}
                className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>✏️ Other (City not in list)</span>
                <span className="text-[11px] text-amber-600 font-normal">Type manually</span>
              </button>

              {filteredCities.map((cityName) => (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => handleSelectCity(cityName)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer ${
                    value === cityName && !isOther ? 'bg-sky-50 font-bold text-cz-primary' : ''
                  }`}
                >
                  {cityName}
                </button>
              ))}

              {filteredCities.length === 0 && (
                <div className="text-[12px] text-slate-400 p-3 text-center">
                  No matching city found. Select &quot;Other&quot; to enter your city manually.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Input when Other is selected */}
      {isOther && (
        <div className="mt-1 flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Enter your exact city name"
            value={customCity}
            onChange={handleCustomCityChange}
            required
            className="w-full rounded-xl border border-amber-300 bg-amber-50/20 text-[14px] text-slate-800 px-4 py-2.5 outline-none focus:border-cz-primary focus:bg-white transition-all font-medium"
          />
          <div className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg font-medium flex items-start gap-1.5">
            <span className="text-[14px]">⚠️</span>
            <span>
              Please enter your exact city name carefully so courier booking and delivery proceed smoothly without misrouting or delays.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
