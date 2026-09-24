import { useCallback, useState } from 'react'
import { api } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useAdminForm } from '../../hooks/useAdminForm'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

const defaultContactData = {
  mainBranch: {
    tagline: 'MAIN BRANCH LOCATION',
    title: 'IT Solutions Lahore Store',
    address: 'Office # 19, 2nd Floor, Fazal Trade Center, Near Hafeez Center, Gulberg III, Lahore, Punjab 54660, Pakistan',
    phone: '+92 300 4265499',
    email: 'itsolutions543@gmail.com',
    hours: 'Monday – Saturday (10:00 AM – 8:00 PM PKT)',
    mapQuery: 'Office # 19, 2nd Floor, Fazal Trade Center, Near Hafeez Center, Gulberg III, Lahore, Punjab 54660, Pakistan',
  },
  deliveryCard: {
    tagline: 'NATIONWIDE DELIVERY & BRANCH NETWORK',
    title: 'Serving All Cities Across Pakistan',
    description:
      'We provide fast Cash on Delivery (COD) and courier dispatch to Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Burewala, Peshawar, Quetta, and 200+ cities nationwide.',
    features: [
      { title: 'Official Brand Warranty:', description: '100% Original products with brand support' },
      { title: 'Free Shipping:', description: 'On your 1st order nationwide (Rs 180 standard)' },
      { title: '7-Day Return Guarantee:', description: 'Hassle-free return & exchange policy' },
      { title: 'Dedicated Technical Support:', description: 'Direct WhatsApp & phone assistance' },
    ],
  },
  regionalBranch: {
    title: 'Burewala Regional Branch',
    address: 'Store # 12, Main College Road, Burewala, Vehari, Punjab 61010',
    mapQuery: 'Main College Road Burewala',
  },
}

export default function AdminContact() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Contact Us Page — Manage Your Store | ${siteName || 'IT Solutions'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })

  const [contactData, setContactData] = useState(defaultContactData)

  const load = useCallback(
    () =>
      api.get(ENDPOINTS.CONTENT.CONTACT_US).then((data) => {
        if (data) {
          setContactData({
            mainBranch: {
              ...defaultContactData.mainBranch,
              ...(data.mainBranch || {}),
            },
            deliveryCard: {
              ...defaultContactData.deliveryCard,
              ...(data.deliveryCard || {}),
              features: Array.isArray(data.deliveryCard?.features) && data.deliveryCard.features.length
                ? data.deliveryCard.features
                : defaultContactData.deliveryCard.features,
            },
            regionalBranch: {
              ...defaultContactData.regionalBranch,
              ...(data.regionalBranch || {}),
            },
          })
        }
      }),
    []
  )

  const { loading, saving, saved, error, save } = useAdminForm(load)

  const updateMainBranch = (field, value) => {
    setContactData((prev) => ({
      ...prev,
      mainBranch: { ...prev.mainBranch, [field]: value },
    }))
  }

  const updateDeliveryCard = (field, value) => {
    setContactData((prev) => ({
      ...prev,
      deliveryCard: { ...prev.deliveryCard, [field]: value },
    }))
  }

  const updateFeature = (index, field, value) => {
    setContactData((prev) => {
      const updatedFeatures = prev.deliveryCard.features.map((feat, i) =>
        i === index ? { ...feat, [field]: value } : feat
      )
      return {
        ...prev,
        deliveryCard: { ...prev.deliveryCard, features: updatedFeatures },
      }
    })
  }

  const addFeature = () => {
    setContactData((prev) => ({
      ...prev,
      deliveryCard: {
        ...prev.deliveryCard,
        features: [...prev.deliveryCard.features, { title: '', description: '' }],
      },
    }))
  }

  const removeFeature = (index) => {
    setContactData((prev) => ({
      ...prev,
      deliveryCard: {
        ...prev.deliveryCard,
        features: prev.deliveryCard.features.filter((_, i) => i !== index),
      },
    }))
  }

  const updateRegionalBranch = (field, value) => {
    setContactData((prev) => ({
      ...prev,
      regionalBranch: { ...prev.regionalBranch, [field]: value },
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    save(() =>
      api.put(
        ENDPOINTS.ADMIN.CONTENT.CONTACT_US,
        {
          mainBranch: {
            ...contactData.mainBranch,
            tagline: contactData.mainBranch.tagline.trim(),
            title: contactData.mainBranch.title.trim(),
            address: contactData.mainBranch.address.trim(),
            phone: contactData.mainBranch.phone.trim(),
            email: contactData.mainBranch.email.trim(),
            hours: contactData.mainBranch.hours.trim(),
            mapQuery: contactData.mainBranch.mapQuery.trim(),
          },
          deliveryCard: {
            tagline: contactData.deliveryCard.tagline.trim(),
            title: contactData.deliveryCard.title.trim(),
            description: contactData.deliveryCard.description.trim(),
            features: contactData.deliveryCard.features
              .map((f) => ({ title: f.title.trim(), description: f.description.trim() }))
              .filter((f) => f.title !== '' || f.description !== ''),
          },
          regionalBranch: {
            title: contactData.regionalBranch.title.trim(),
            address: contactData.regionalBranch.address.trim(),
            mapQuery: contactData.regionalBranch.mapQuery.trim(),
          },
        },
        { auth: true }
      )
    )
  }

  if (loading) return <div className="p-8 text-[14px] text-[#4b4b4b]">Loading...</div>

  return (
    <div className="p-8 max-w-[800px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#212121]">Contact Us Page Editor</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Customize the Main Branch details, Google Maps embed query, Nationwide Delivery & Branch Network card, feature bullets, and Regional Branch details.
        </p>
        <SeoHeadingFiller h3="Main branch location" h4="Delivery network" h5="Regional branch" h6="Save changes" />
      </div>

      {error && <div className="text-[14px] text-red-600 mb-4 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
      {saved && (
        <div className="text-[14px] text-green-700 mb-4 bg-green-50 p-3 rounded-md border border-green-200">
          ✨ Saved successfully! Refresh your Contact Us page to see your live changes.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Main Branch Location Section */}
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-1">1. Main Branch Location & Contact</h2>
          <p className="text-[12px] text-[#6b7280] mb-4">Displayed on the left side of the Contact page with interactive map embed.</p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Section Tagline</label>
              <input
                type="text"
                value={contactData.mainBranch.tagline}
                onChange={(e) => updateMainBranch('tagline', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="MAIN BRANCH LOCATION"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Branch Title</label>
              <input
                type="text"
                value={contactData.mainBranch.title}
                onChange={(e) => updateMainBranch('title', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="IT Solutions Lahore Store"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Physical Address</label>
              <textarea
                rows={2}
                value={contactData.mainBranch.address}
                onChange={(e) => updateMainBranch('address', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary resize-none"
                placeholder="Store address..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={contactData.mainBranch.phone}
                  onChange={(e) => updateMainBranch('phone', e.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                  placeholder="+92 300 4265499"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1">Support Email</label>
                <input
                  type="email"
                  value={contactData.mainBranch.email}
                  onChange={(e) => updateMainBranch('email', e.target.value)}
                  className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                  placeholder="itsolutions543@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Working Hours</label>
              <input
                type="text"
                value={contactData.mainBranch.hours}
                onChange={(e) => updateMainBranch('hours', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="Monday – Saturday (10:00 AM – 8:00 PM PKT)"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Google Maps Location Search Query</label>
              <input
                type="text"
                value={contactData.mainBranch.mapQuery}
                onChange={(e) => updateMainBranch('mapQuery', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="Location address or coordinates for Google Maps map embed"
              />
              <p className="text-[11px] text-[#6b7280] mt-1">Used for embedding map iframe and linking 'Open Directions in Google Maps'.</p>
            </div>
          </div>
        </div>

        {/* Nationwide Delivery & Branch Network Section */}
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-1">2. Nationwide Delivery & Branch Network Card</h2>
          <p className="text-[12px] text-[#6b7280] mb-4">Displayed on the right side of the Contact page with feature bullet list.</p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Card Tagline</label>
              <input
                type="text"
                value={contactData.deliveryCard.tagline}
                onChange={(e) => updateDeliveryCard('tagline', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="NATIONWIDE DELIVERY & BRANCH NETWORK"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Card Title</label>
              <input
                type="text"
                value={contactData.deliveryCard.title}
                onChange={(e) => updateDeliveryCard('title', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="Serving All Cities Across Pakistan"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Card Description</label>
              <textarea
                rows={3}
                value={contactData.deliveryCard.description}
                onChange={(e) => updateDeliveryCard('description', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary resize-none"
                placeholder="Description of nationwide delivery and service..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-semibold text-[#374151]">Feature Bullet Points</label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-cz-primary hover:underline text-[12px] font-medium"
                >
                  + Add Feature
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {contactData.deliveryCard.features.map((feat, idx) => (
                  <div key={idx} className="p-3 border border-[#e5e7eb] rounded-lg bg-[#f9fafb] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#6b7280]">Feature #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-red-600 hover:underline text-[12px]"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                      placeholder="Title Prefix (e.g. Official Brand Warranty:)"
                      className="w-full rounded-md border border-[#d1d5db] text-[13px] px-3 py-1.5 outline-none focus:border-cz-primary bg-white"
                    />
                    <input
                      type="text"
                      value={feat.description}
                      onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                      placeholder="Description text..."
                      className="w-full rounded-md border border-[#d1d5db] text-[13px] px-3 py-1.5 outline-none focus:border-cz-primary bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Regional Branch Section */}
        <div className="bg-white rounded-[10px] border border-[#dedede] p-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#212121] mb-1">3. Regional Branch Info</h2>
          <p className="text-[12px] text-[#6b7280] mb-4">Displayed at the bottom of the right-hand Delivery card.</p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Regional Branch Title</label>
              <input
                type="text"
                value={contactData.regionalBranch.title}
                onChange={(e) => updateRegionalBranch('title', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="Burewala Regional Branch"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Regional Branch Address</label>
              <input
                type="text"
                value={contactData.regionalBranch.address}
                onChange={(e) => updateRegionalBranch('address', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="Store # 12, Main College Road, Burewala, Vehari, Punjab 61010"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1">Google Maps Query / Location</label>
              <input
                type="text"
                value={contactData.regionalBranch.mapQuery}
                onChange={(e) => updateRegionalBranch('mapQuery', e.target.value)}
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                placeholder="Main College Road Burewala"
              />
              <p className="text-[11px] text-[#6b7280] mt-1">Used for the 'Burewala Map Location' button link.</p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold px-8 py-3 transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
          >
            {saving ? 'Saving Changes...' : 'Save Contact Us Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
