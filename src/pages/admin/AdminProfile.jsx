import BrandingSection from '../../components/admin/profile/BrandingSection'
import AccountSection from '../../components/admin/profile/AccountSection'
import PasswordSection from '../../components/admin/profile/PasswordSection'
import TwoFactorSection from '../../components/admin/profile/TwoFactorSection'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

export default function AdminProfile() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Profile — Manage Your Store | ${siteName || 'IT Solutions'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })

  return (
    <div className="p-8 max-w-[640px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Profile</h1>
      <SeoHeadingFiller h3="Branding fields" h4="Account fields" h5="Password fields" h6="Two-factor actions" />
      <div className="flex flex-col gap-6">
        <BrandingSection />
        <AccountSection />
        <PasswordSection />
        <TwoFactorSection />
      </div>
    </div>
  )
}
