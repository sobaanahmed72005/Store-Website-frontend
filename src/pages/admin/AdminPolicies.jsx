import PolicyPageEditor from '../../components/admin/PolicyPageEditor'

export default function AdminPolicies() {
  return (
    <PolicyPageEditor
      title="Policies Page"
      getEndpoint="/content/policies"
      saveEndpoint="/admin/content/policies"
      savedMessage="Saved. Refresh the Return & Exchange page to see it live."
      addSectionLabel="Add Policy Section"
    />
  )
}
