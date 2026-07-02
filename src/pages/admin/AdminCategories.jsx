import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, uploadImage, resolveImageUrl } from '../../api/client'
import { ADMIN_PATH } from '../../config/adminPath'

const emptyForm = { name: '', slug: '', parent_id: '', image: '', description: '', show_in_nav: true, show_in_icons: true }

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchCategories = () =>
    api
      .get('/admin/categories', { auth: true })
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

  const load = () => {
    setLoading(true)
    fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const topLevelCategories = categories.filter((c) => !c.parent_id)
  const rows = topLevelCategories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .flatMap((parent) => [
      parent,
      ...categories
        .filter((c) => c.parent_id === parent.id)
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    ])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setSlugTouched(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }
      if (name === 'name' && !slugTouched) next.slug = slugify(value)
      return next
    })
    if (name === 'slug') setSlugTouched(true)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await uploadImage(file)
      setForm((prev) => ({ ...prev, image: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      name: form.name,
      slug: form.slug,
      image: form.image || null,
      description: form.description || null,
      parent_id: form.parent_id || null,
      show_in_nav: form.parent_id ? false : form.show_in_nav,
      show_in_icons: form.parent_id ? false : form.show_in_icons,
    }
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, payload, { auth: true })
      } else {
        await api.post('/admin/categories', payload, { auth: true })
      }
      resetForm()
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id ?? '',
      image: category.image ?? '',
      description: category.description ?? '',
      show_in_nav: Boolean(category.show_in_nav),
      show_in_icons: Boolean(category.show_in_icons),
    })
    setSlugTouched(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Its subcategories will also be deleted and products in it will be unassigned.')) return
    try {
      await api.del(`/admin/categories/${id}`, { auth: true })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Categories</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white rounded-[10px] border border-[#dedede] p-5 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Parent Category</label>
            <select
              name="parent_id"
              value={form.parent_id}
              onChange={handleChange}
              className="rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary bg-white"
            >
              <option value="">None (top-level category)</option>
              {topLevelCategories
                .filter((c) => c.id !== editingId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Image</label>
            <div className="flex items-center gap-3">
              {form.image && (
                <img src={resolveImageUrl(form.image)} alt="Preview" className="w-10 h-10 object-cover rounded-md border border-[#dedede]" />
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-[13px]" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Page Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="The intro text shown under the page heading when customers visit this category."
            className="w-full max-w-[640px] rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
          />
        </div>

        {!form.parent_id && (
          <div className="flex flex-col gap-1.5">
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Visibility</label>
            <label className="flex items-center gap-2 text-[13px] text-[#212121]">
              <input type="checkbox" name="show_in_nav" checked={form.show_in_nav} onChange={handleChange} />
              Show in top navigation menu
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#212121]">
              <input type="checkbox" name="show_in_icons" checked={form.show_in_icons} onChange={handleChange} />
              Show in home page category icons
            </label>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : editingId ? 'Save' : 'Add Category'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-[14px] text-[#4b4b4b] px-3 py-2.5">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
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
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No categories yet.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="border-t border-[#dedede]">
                  <td className="px-4 py-3">
                    {c.image ? (
                      <img src={resolveImageUrl(c.image)} alt={c.name} className="w-9 h-9 object-cover rounded-md border border-[#dedede]" />
                    ) : (
                      <div className="w-9 h-9 rounded-md border border-[#dedede] bg-cz-gold-light" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#212121]">
                    <span style={{ paddingLeft: c.parent_id ? 20 : 0 }} className={c.parent_id ? 'text-[#4b4b4b]' : 'font-medium'}>
                      {c.parent_id ? '↳ ' : ''}
                      {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4b4b4b]">{c.slug}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to={`${ADMIN_PATH}/categories/${c.id}/filters`} className="text-cz-primary hover:underline mr-3">
                      Filters
                    </Link>
                    <button type="button" onClick={() => handleEdit(c)} className="text-cz-primary hover:underline mr-3">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                      Delete
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
