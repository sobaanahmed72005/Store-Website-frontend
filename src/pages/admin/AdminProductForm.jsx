import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api, uploadImage, uploadVideo, resolveImageUrl } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { ADMIN_PATH } from '../../config/adminPath'
import MultiSelectDropdown from '../../components/admin/MultiSelectDropdown'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

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
  video: '',
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

// Stable key for a variant combination — one option (its full merged `ids` array) per dimension
// attribute — so re-selecting the same combination after toggling something else still finds its
// already-typed price/stock instead of losing it.
function comboKey(optionIdGroups) {
  return optionIdGroups
    .map((ids) => [...ids].sort((a, b) => a - b).join(','))
    .sort()
    .join('|')
}

function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => acc.flatMap((combo) => curr.map((item) => [...combo, item])), [[]])
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { siteName } = useSiteSettings()
  useSeo({
    title: `${isEdit ? 'Edit Product' : 'Add Product'} — Manage Your Store | ${siteName || 'IT Solutions'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [attributes, setAttributes] = useState([])
  const [selectedOptionIds, setSelectedOptionIds] = useState(() => new Set())
  const [pendingOptionIds, setPendingOptionIds] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryUploading, setGalleryUploading] = useState(false)
  // comboKey -> { price, stock, discount_price }. Populated from the loaded product's variants
  // once attributes are loaded (see the reconciliation effect below).
  const [variantRows, setVariantRows] = useState(() => new Map())
  const [pendingVariants, setPendingVariants] = useState(null)
  const [variantsOnSale, setVariantsOnSale] = useState(false)
  // { [attributeName]: value } — lets the admin explicitly choose what a variant-defining
  // attribute (2+ selected options) should display as in Specifications, since there's no single
  // correct auto-derived value once that attribute has multiple options on the same product.
  const [specOverrides, setSpecOverrides] = useState({})
  const [existingBrands, setExistingBrands] = useState([])

  useEffect(() => {
    api.get(ENDPOINTS.ADMIN.CATEGORIES.BASE, { auth: true }).then(setCategories).catch((err) => setError(err.message))
  }, [])

  // Powers the Brand field's autocomplete below — Brand isn't a category-attribute (that's
  // blocked, see categoryAttributesController.js), so this is just "what's already been typed
  // into other products", letting an admin pick the exact existing spelling/casing instead of
  // retyping it and risking a near-duplicate like "Dell" vs "dell".
  useEffect(() => {
    api.get(ENDPOINTS.ADMIN.PRODUCTS.BRANDS, { auth: true }).then(setExistingBrands).catch(() => setExistingBrands([]))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api
      .get(ENDPOINTS.ADMIN.PRODUCTS.BY_ID(id), { auth: true })
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
          video: p.video ?? '',
          is_featured: Boolean(p.is_featured),
          is_new_arrival: Boolean(p.is_new_arrival),
          is_on_sale: Boolean(p.is_on_sale),
        })
        setPendingOptionIds(p.attribute_option_ids || [])
        setGalleryImages(p.images || [])
        setPendingVariants(p.variants || [])
        setSpecOverrides(Object.fromEntries((p.spec_overrides || []).map((o) => [o.attribute_name, o.value])))
      })
      .catch((err) => setError(err.message))
  }, [id, isEdit])

  useEffect(() => {
    if (!form.category_id) {
      setAttributes([])
      return
    }
    api
      .get(ENDPOINTS.ADMIN.CATEGORIES.ATTRIBUTES_MERGED(form.category_id), { auth: true })
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

  // Reconstructs variantRows from the loaded product's variants once attributes have settled —
  // mirrors the pendingOptionIds reconciliation above. Waits on selectedOptionIds too since that's
  // what determines which attributes count as variant "dimensions" below.
  useEffect(() => {
    if (!pendingVariants || attributes.length === 0) return
    const brandAttrLocal = attributes.find((a) => a.name.trim().toLowerCase() === 'brand')
    const nonBrandLocal = attributes.filter((a) => a !== brandAttrLocal)
    const dims = nonBrandLocal.filter(
      (attr) => attr.options.filter((opt) => opt.ids.some((id) => selectedOptionIds.has(id))).length >= 2
    )
    const nextRows = new Map()
    let anyOnSale = false
    for (const v of pendingVariants) {
      const perAttr = dims.map((attr) => {
        const match = v.options.find((vo) => vo.attribute === attr.name)
        return match ? attr.options.find((opt) => opt.value === match.value) : null
      })
      if (perAttr.length > 0 && perAttr.every(Boolean)) {
        if (v.discount_price != null) anyOnSale = true
        nextRows.set(comboKey(perAttr.map((o) => o.ids)), {
          price: v.price,
          stock: v.stock,
          discount_price: v.discount_price ?? '',
        })
      }
    }
    setVariantRows(nextRows)
    setVariantsOnSale(anyOnSale)
    setPendingVariants(null)
  }, [attributes, selectedOptionIds, pendingVariants])

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

  const brandAttr = attributes.find((a) => a.name.trim().toLowerCase() === 'brand')
  const nonBrandAttributes = attributes.filter((a) => a !== brandAttr)
  const dimensionAttrs = nonBrandAttributes.filter(
    (attr) => attr.options.filter((opt) => opt.ids.some((id) => selectedOptionIds.has(id))).length >= 2
  )
  const activeCombos =
    dimensionAttrs.length === 0
      ? []
      : cartesianProduct(
          dimensionAttrs.map((attr) => attr.options.filter((opt) => opt.ids.some((id) => selectedOptionIds.has(id))))
        ).map((comboOptions) => ({
          key: comboKey(comboOptions.map((o) => o.ids)),
          optionIds: comboOptions.flatMap((o) => o.ids),
          label: comboOptions.map((o) => o.value).join(' / '),
        }))

  const updateVariantRow = (key, field, value) => {
    setVariantRows((prev) => {
      const next = new Map(prev)
      next.set(key, { ...next.get(key), [field]: value })
      return next
    })
  }

  const toggleVariantsOnSale = (checked) => {
    setVariantsOnSale(checked)
    // Turning it off means "no variant is on sale" — clear any sale prices already typed in,
    // rather than leaving them stored-but-hidden and still silently in effect.
    if (!checked) {
      setVariantRows((prev) => {
        const next = new Map(prev)
        for (const [key, row] of next) next.set(key, { ...row, discount_price: '' })
        return next
      })
    }
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

  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoUploading(true)
    setError('')
    try {
      const { url } = await uploadVideo(file)
      setForm((prev) => ({ ...prev, video: url }))
    } catch (err) {
      setError(err.message)
    } finally {
      setVideoUploading(false)
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

  const removeVideo = () => {
    setForm((prev) => ({ ...prev, video: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (activeCombos.length > 0) {
      const incomplete = activeCombos.some((combo) => {
        const row = variantRows.get(combo.key)
        if (!row || row.price === '' || row.price == null) return true
        if (variantsOnSale && (row.discount_price === '' || row.discount_price == null)) return true
        return false
      })
      if (incomplete) {
        setError(
          variantsOnSale
            ? 'Please enter a price and sale price for every variant combination below.'
            : 'Please enter a price for every variant combination below.'
        )
        return
      }
    }

    setSaving(true)
    try {
      const variants = activeCombos.map((combo) => {
        const row = variantRows.get(combo.key) || {}
        return {
          option_ids: combo.optionIds,
          price: Number(row.price),
          stock: Number(row.stock) || 0,
          discount_price: row.discount_price !== '' && row.discount_price != null ? Number(row.discount_price) : null,
        }
      })
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
        video: form.video || null,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_on_sale: form.is_on_sale,
        attribute_option_ids: [...selectedOptionIds],
        images: galleryImages,
        variants,
        spec_overrides: Object.fromEntries(
          dimensionAttrs
            .map((attr) => [attr.name, (specOverrides[attr.name] || '').trim()])
            .filter(([, value]) => value !== '')
        ),
      }
      if (isEdit) {
        await api.put(ENDPOINTS.ADMIN.PRODUCTS.BY_ID(id), payload, { auth: true })
      } else {
        await api.post(ENDPOINTS.ADMIN.PRODUCTS.BASE(), payload, { auth: true })
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
      <SeoHeadingFiller h2="Product form" h3="Attributes" h4="Image upload" h5="Gallery" h6="Save action" />

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
              list="existing-brands"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Dell"
              className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2.5 outline-none focus:border-cz-primary"
            />
            {/* Native browser autocomplete against every brand already used elsewhere in the
                store, so typing "de" suggests the existing "Dell" instead of risking a
                near-duplicate like "dell" that the storefront filter would then show twice. */}
            <datalist id="existing-brands">
              {existingBrands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
        </div>

        {nonBrandAttributes.length > 0 && (
          <div className="rounded-md border border-[#dedede] p-4 flex flex-col gap-3">
            <span className="block text-[13px] text-[#4b4b4b]">Filters (shown on this category's storefront page)</span>
            {nonBrandAttributes.map((attr) => {
              const selectedForAttr = attr.options.filter((opt) => opt.ids.some((id) => selectedOptionIds.has(id)))
              const isDimension = selectedForAttr.length >= 2
              return (
                <div key={attr.id}>
                  <span className="block text-[13px] font-medium text-[#212121] mb-1.5">
                    {attr.name}
                    {attr.inherited && (
                      <span className="ml-1.5 text-[11px] font-normal text-[#9ca3af]">(inherited from parent category)</span>
                    )}
                  </span>
                  <MultiSelectDropdown
                    options={attr.options.map((opt) => ({ id: opt.ids[0], label: opt.value }))}
                    selectedIds={new Set(selectedForAttr.map((opt) => opt.ids[0]))}
                    onToggle={(repId) => {
                      const opt = attr.options.find((o) => o.ids[0] === repId)
                      if (opt) toggleOption(opt.ids)
                    }}
                  />
                  {isDimension && (
                    <div className="mt-2">
                      <label className="block text-[12px] text-[#4b4b4b] mb-1">
                        This is now a variant ({selectedForAttr.map((o) => o.value).join(', ')}) — what should it show as
                        under Specifications?
                      </label>
                      <input
                        type="text"
                        value={specOverrides[attr.name] ?? ''}
                        onChange={(e) => setSpecOverrides((prev) => ({ ...prev, [attr.name]: e.target.value }))}
                        placeholder={`e.g. ${selectedForAttr.map((o) => o.value).join(' / ')}`}
                        className="w-full rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeCombos.length > 0 && (
          <div className="rounded-md border border-[#dedede] p-4 flex flex-col gap-3">
            <span className="block text-[13px] text-[#4b4b4b]">
              Variants — this product is offered in {activeCombos.length} combinations below; each needs its own price.
              Selecting more than one option for a filter above turns it into a variant.
            </span>

            <label className="flex items-center gap-2 text-[14px] text-[#212121]">
              <input
                type="checkbox"
                checked={variantsOnSale}
                onChange={(e) => toggleVariantsOnSale(e.target.checked)}
              />
              Put all variants on sale
            </label>

            <div className="flex flex-col gap-2">
              {activeCombos.map((combo) => {
                const row = variantRows.get(combo.key) || {}
                return (
                  <div
                    key={combo.key}
                    className={`grid ${variantsOnSale ? 'grid-cols-[1fr_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto]'} gap-2 items-center`}
                  >
                    <span className="text-[14px] text-[#212121]">{combo.label}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price (PKR)"
                      value={row.price ?? ''}
                      onChange={(e) => updateVariantRow(combo.key, 'price', e.target.value)}
                      className="w-[130px] rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={row.stock ?? ''}
                      onChange={(e) => updateVariantRow(combo.key, 'stock', e.target.value)}
                      className="w-[100px] rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                    />
                    {variantsOnSale && (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Sale Price (PKR)"
                        value={row.discount_price ?? ''}
                        onChange={(e) => updateVariantRow(combo.key, 'discount_price', e.target.value)}
                        className="w-[140px] rounded-md border border-[#d1d5db] text-[14px] px-3 py-2 outline-none focus:border-cz-primary"
                      />
                    )}
                  </div>
                )
              })}
            </div>
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

        {activeCombos.length === 0 && (
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
        )}

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
              <img src={resolveImageUrl(form.image)} alt="Preview" width={64} height={64} className="w-16 h-16 object-cover rounded-md border border-[#dedede]" />
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
                <img src={resolveImageUrl(img)} alt="Gallery" width={64} height={64} className="w-16 h-16 object-cover rounded-md border border-[#dedede]" />
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

        <div>
          <label className="block text-[13px] text-[#4b4b4b] mb-1">Product Video (optional)</label>
          <div className="flex items-center gap-4">
            {form.video && (
              <div className="relative">
                <video src={resolveImageUrl(form.video)} className="w-24 h-16 object-cover rounded-md border border-[#dedede] bg-black" />
                <button
                  type="button"
                  aria-label="Remove video"
                  onClick={removeVideo}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-[#dedede] text-[12px] text-red-600 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            <input type="file" accept="video/mp4,video/webm" onChange={handleVideoFileChange} className="text-[13px]" />
          </div>
          {videoUploading && <div className="text-[13px] text-[#4b4b4b] mt-1">Uploading...</div>}
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={saving || uploading || videoUploading}
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
