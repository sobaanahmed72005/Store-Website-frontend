import PolicyPageEditor from '../../components/admin/PolicyPageEditor'

export default function AdminPrivacyPolicy() {
  return (
    <PolicyPageEditor
      title="Privacy Policy Page"
      getEndpoint="/content/privacy-policy"
      saveEndpoint="/admin/content/privacy-policy"
      savedMessage="Saved. Refresh the Privacy Policy page to see it live."
      addSectionLabel="Add Section"
    />
  )
}
