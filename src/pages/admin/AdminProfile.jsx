import BrandingSection from '../../components/admin/profile/BrandingSection'
import AccountSection from '../../components/admin/profile/AccountSection'
import PasswordSection from '../../components/admin/profile/PasswordSection'
import TwoFactorSection from '../../components/admin/profile/TwoFactorSection'

export default function AdminProfile() {
  return (
    <div className="p-8 max-w-[640px]">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Profile</h1>
      <div className="flex flex-col gap-6">
        <BrandingSection />
        <AccountSection />
        <PasswordSection />
        <TwoFactorSection />
      </div>
    </div>
  )
}
