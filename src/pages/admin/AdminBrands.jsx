import { useState } from 'react'
import { useBrandStore } from '../../store/brandStore'
import { useSeo } from '../../hooks/useSeo'

export default function AdminBrands() {
  useSeo({ title: 'Admin - Brands Orbit', noindex: true })

  const { brands, addBrand, updateBrand, deleteBrand, resetToDefault } = useBrandStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    date: '',
    logoUrl: '',
    content: '',
  })

  const openAddModal = () => {
    setEditingBrand(null)
    setFormData({
      title: '',
      category: 'Computers & Mobile',
      date: 'EST ' + new Date().getFullYear(),
      logoUrl: '',
      content: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (brand) => {
    setEditingBrand(brand)
    setFormData({
      title: brand.title || '',
      category: brand.category || '',
      date: brand.date || '',
      logoUrl: brand.logoUrl || '',
      content: brand.content || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Please enter brand title')
      return
    }

    if (editingBrand) {
      updateBrand(editingBrand.id, formData)
    } else {
      addBrand(formData)
    }

    setModalOpen(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brands Orbit Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, edit, or remove brands displaying in the 3D horizontal homepage orbit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset brands list back to original 11 tech brands?')) {
                resetToDefault()
              }
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0c4a6e] hover:bg-[#0369a1] rounded-lg shadow-sm transition"
          >
            + Add New Brand
          </button>
        </div>
      </div>

      {/* Brands List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Logo</th>
                <th className="py-3.5 px-4">Brand Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Established</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-full border border-slate-200 p-1.5 flex items-center justify-center bg-slate-50">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.title} className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-bold text-xs text-slate-400">{brand.title?.substring(0, 2)}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{brand.title}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200">
                      {brand.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-500">{brand.date}</td>
                  <td className="py-3 px-4 max-w-xs text-xs text-slate-600 truncate">{brand.content}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(brand)}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${brand.title} from Brands Orbit?`)) {
                            deleteBrand(brand.id)
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Logitech, Corsair"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Gaming Gear, Laptops, Audio"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Established Date</label>
                <input
                  type="text"
                  placeholder="e.g. EST 1994"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                <input
                  type="url"
                  placeholder="https://cdn.simpleicons.org/sony/000000"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: You can use SVG logos from SimpleIcons (e.g. https://cdn.simpleicons.org/[brand-slug])
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter brand highlights and product offerings..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#0c4a6e] hover:bg-[#0369a1] rounded-lg shadow-sm transition"
                >
                  {editingBrand ? 'Save Changes' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
