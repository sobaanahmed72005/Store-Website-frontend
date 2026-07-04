import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, resolveImageUrl } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'
import { getEffectivePrice } from '../../utils/pricing'
import { ADMIN_PATH } from '../../config/adminPath'

export default function AdminProducts() {
  const { format } = useCurrency()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = () =>
    api
      .get('/admin/products', { auth: true })
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    try {
      await api.del(`/admin/products/${id}`, { auth: true })
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[#212121]">Products</h1>
        <Link
          to={`${ADMIN_PATH}/products/new`}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded-[10px] border border-[#dedede] overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-cz-gold-light text-left text-[#4b4b4b]">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#4b4b4b]">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#4b4b4b]">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const { price, oldPrice } = getEffectivePrice(p)
                return (
                  <tr key={p.id} className="border-t border-[#dedede]">
                    <td className="px-4 py-3">
                      {p.image ? (
                        <img src={resolveImageUrl(p.image)} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-cz-gold-light" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#212121]">{p.name}</td>
                    <td className="px-4 py-3 text-[#4b4b4b]">{p.category_name || '—'}</td>
                    <td className="px-4 py-3 text-[#212121]">
                      {format(price)}
                      {oldPrice && (
                        <span className="ml-2 text-[12px] text-[#9ca3af] line-through">{format(oldPrice)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 5 ? 'text-red-600 font-medium' : 'text-[#212121]'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Boolean(p.is_featured) && (
                          <span className="rounded-full bg-cz-accent text-cz-ink text-[11px] font-medium px-2 py-0.5">Featured</span>
                        )}
                        {Boolean(p.is_new_arrival) && (
                          <span className="rounded-full bg-cz-lavender text-cz-ink text-[11px] font-medium px-2 py-0.5">New</span>
                        )}
                        {Boolean(p.is_on_sale) && (
                          <span className="rounded-full bg-cz-primary text-white text-[11px] font-medium px-2 py-0.5">Sale</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link to={`${ADMIN_PATH}/products/${p.id}/edit`} className="text-cz-primary hover:underline mr-3">
                        Edit
                      </Link>
                      <button type="button" onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
