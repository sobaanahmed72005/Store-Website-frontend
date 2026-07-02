import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api, uploadImage, resolveImageUrl } from '../../api/client'
import { ADMIN_PATH } from '../../config/adminPath'

const emptyForm = {
  name: '',
  slug: '',
  category_id: '',
  brand: '',
  description: '',
  price: '',
  discount_price: '',
  stock: '0',
  image: '',
  is_featured: false,
  is_new_arrival: false,
  is_on_sale: false,
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [attributes, setAttributes] = useState([])
  const [selectedOptionIds, setSelectedOptionIds] = useState(() => new Set())
  const [pendingOptionIds, setPendingOptionIds] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryUploading, setGalleryUploading] = useState(false)

  useEffect(() => {
    api.get('/admin/categories', { auth: true }).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api
      .get(`/admin/products/${id}`, { auth: true })
      .then((p) => {
        setForm({
          name: p.name,
          slug: p.slug,
          category_id: p.category_id ?? '',
          brand: p.brand ?? '',
          description: p.description ?? '',
          price: p.price,
          discount_price: p.discount_price ?? '',
          stock: p.stock,
          image: p.image ?? '',
          is_featured: Boolean(p.is_featured),
          is_new_arrival: Boolean(p.is_new_arrival),
          is_on_sale: Boolean(p.is_on_sale),
        })
        setPendingOptionIds(p.attribute_option_ids || [])
        setGalleryImages(p.images || [])
      })
      .catch((err) => setError(err.message))
  }, [id, isEdit])

  useEffect(() => {
    if (!form.category_id) {
      setAttributes([])
      return
    }
    api
      .get(`/admin/categories/${form.category_id}/attributes?merged=1`, { auth: true })
      .then((attrs) => {
        setAttributes(attrs)
        const validOptionIds = new Set(attrs.flatMap((a) => a.options.flatMap((o) => o.ids)))
        if (pendingOptionIds) {
          setSelectedOptionIds(new Set(pendingOptionIds.filter((id) => validOptionIds.has(id))))
          setPendingOptionIds(null)
        } else {
          setSelectedOptionIds((prev) => new Set([...prev].filter((id) => validOptionIds.has(id))))
        }
      })
      .catch(() => setAttributes([]))
  }, [form.category_id])

  const toggleOption = (optionIds) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      const anySelected = optionIds.some((id) => next.has(id))
      for (const id of optionIds) {
        if (anySelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
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

  const handleGalleryFilesChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setGalleryUploading(true)
    setError('')
    try {
      for (const file of files) {
        const { url } = await uploadImage(file)
        setGalleryImages((prev) => [...prev, url])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setGalleryUploading(false)
    }
  }

  const removeGalleryImage = (url) => {
    setGalleryImages((prev) => prev.filter((img) => img !== url))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        category_id: form.category_id || null,
        brand: form.brand,
        description: form.description,
        price: Number(form.price),
        discount_price: form.discount_price ? Number(form.discount_price) : null,
        stock: Number(form.stock) || 0,
        image: form.image,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_on_sale: form.is_on_sale,
        attribute_option_ids: [...selectedOptionIds],
        images: galleryImages,
      }
      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload, { auth: true })
      } else {
        await api.post('/admin/products', payload, { auth: true })
      }
      navigate(`${ADMIN_PATH}/products`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-[640px]">
      <div className="flex items-center gap-2 text-[13px] text-[#4b4b4b] mb-2">
        <Link to={`${ADMIN_PATH}/products`} className="hover:underline">
          Products
        </Link>
        <span>/</span>
        <span>{isEdit ? 'Edit' : 'New'}</span>
      </div>
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white rounded-[10px] border border-[#dedede] p-6">
        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary bg-white"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Brand</label>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
        </div>

        {attributes.length > 0 && (
          <div className="rounded-md border border-[#dedede] p-4 flex flex-col gap-3">
            <span className="block text-[13px] text-[#4b4b4b]">Filters (shown on this category's storefront page)</span>
            {attributes.map((attr) => (
              <div key={attr.id}>
                <span className="block text-[13px] font-medium text-[#212121] mb-1.5">
                  {attr.name}
                  {attr.inherited && (
                    <span className="ml-1.5 text-[11px] font-normal text-[#9ca3af]">(inherited from parent category)</span>
                  )}
                </span>
                <div className="flex flex-wrap gap-3">
                  {attr.options.length === 0 ? (
                    <span className="text-[13px] text-[#4b4b4b]">No options defined for this filter yet.</span>
                  ) : (
                    attr.options.map((opt) => (
                      <label key={opt.ids[0]} className="flex items-center gap-2 text-[14px] text-[#212121]">
                        <input
                          type="checkbox"
                          checked={opt.ids.some((id) => selectedOptionIds.has(id))}
                          onChange={() => toggleOption(opt.ids)}
                        />
                        {opt.value}
                      </label>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Price (PKR)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] text-[#4b4b4b] mb-1">Stock</label>
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
          </div>
        </div>

        <div className="rounded-md border border-[#dedede] p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-[14px] text-[#212121]">
            <input type="checkbox" name="is_on_sale" checked={form.is_on_sale} onChange={handleChange} />
            On Sale
          </label>
          {form.is_on_sale && (
            <div className="max-w-[240px]">
              <label className="block text-[13px] text-[#4b4b4b] mb-1">Sale Price (PKR)</label>
              <input
                name="discount_price"
                type="number"
                min="0"
                step="0.01"
                value={form.discount_price}
                onChange={handleChange}
                placeholder="New discounted price"
                className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Homepage Visibility</label>
          <label className="flex items-center gap-2 text-[14px] text-[#212121]">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
            Show in Featured Products
          </label>
          <label className="flex items-center gap-2 text-[14px] text-[#212121]">
            <input type="checkbox" name="is_new_arrival" checked={form.is_new_arrival} onChange={handleChange} />
            Show in New Arrivals
          </label>
        </div>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Cover Image</label>
          <div className="flex items-center gap-4">
            {form.image && (
              <img src={resolveImageUrl(form.image)} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-[#dedede]" />
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-[13px]" />
          </div>
          {uploading && <div className="text-[13px] text-[#4b4b4b] mt-1">Uploading...</div>}
        </div>

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Gallery Images (different angles)</label>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            {galleryImages.map((img) => (
              <div key={img} className="relative">
                <img src={resolveImageUrl(img)} alt="Gallery" className="w-16 h-16 object-cover rounded-md border border-[#dedede]" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeGalleryImage(img)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-[#dedede] text-[12px] text-red-600 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} className="text-[13px]" />
          {galleryUploading && <div className="text-[13px] text-[#4b4b4b] mt-1">Uploading...</div>}
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-6 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <Link
            to={`${ADMIN_PATH}/products`}
            className="rounded-md border border-[#d1d5db] text-[#212121] text-[14px] font-medium px-6 py-2.5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
