import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, resolveImageUrl } from '../../api/client'
import { ENDPOINTS } from '../../api/endpoints'
import { useCurrency } from '../../store/currencyStore'
import { getEffectivePrice } from '../../utils/pricing'
import { ADMIN_PATH } from '../../config/adminPath'
import { useAdminForm } from '../../hooks/useAdminForm'
import Pagination from '../../components/Pagination'
import { useSeo } from '../../hooks/useSeo'
import SeoHeadingFiller from '../../components/SeoHeadingFiller'
import { useSiteSettings } from '../../store/siteSettingsStore'

export default function AdminProducts() {
  const { siteName } = useSiteSettings()
  useSeo({
    title: `Products — Manage Your Store | ${siteName || 'IT Network'} Admin Panel`,
    canonical: `${window.location.origin}${window.location.pathname}`,
    noindex: true,
  })
  const { format } = useCurrency()
  const [searchParams] = useSearchParams()
  const lowStockOnly = searchParams.get('low_stock') === '1'
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const queryPath = ENDPOINTS.ADMIN.PRODUCTS.BASE(lowStockOnly ? '?low_stock=1' : '')
  const separator = queryPath.includes('?') ? '&' : '?'

  const load = useCallback(
    () =>
      api.get(queryPath, { auth: true }).then((data) => {
        setProducts(data.products)
        setPage(data.page)
        setTotalPages(data.totalPages)
      }),
    [queryPath]
  )
  const { loading, error, setError, reload } = useAdminForm(load)

  const goToPage = async (nextPage) => {
    const data = await api.get(`${queryPath}${separator}page=${nextPage}`, { auth: true })
    setProducts(data.products)
    setPage(data.page)
    setTotalPages(data.totalPages)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    try {
      await api.del(ENDPOINTS.ADMIN.PRODUCTS.BY_ID(id), { auth: true })
      reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-[#212121]">Products</h1>
        <SeoHeadingFiller h2="Product list" h3="Search and filter" h4="Stock status" h5="Edit action" h6="Delete action" />
        <Link
          to={`${ADMIN_PATH}/products/new`}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      {lowStockOnly && (
        <div className="flex items-center justify-between rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 text-[13px] px-4 py-3 mb-4">
          <span>Showing only low-stock products (5 or fewer in stock).</span>
          <Link to={`${ADMIN_PATH}/products`} className="font-medium hover:underline">
            Clear filter
          </Link>
        </div>
      )}

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
                        <img src={resolveImageUrl(p.image)} alt={p.name} width={48} height={48} className="w-12 h-12 object-cover rounded-md" />
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
      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </div>
  )
}
