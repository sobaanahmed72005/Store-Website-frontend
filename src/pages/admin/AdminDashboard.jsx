import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'
import { ADMIN_PATH } from '../../config/adminPath'

function StatCard({ label, value, to }) {
  const content = (
    <div className="rounded-[10px] bg-white border border-[#dedede] p-5 hover:border-cz-primary transition-colors">
      <div className="text-[13px] text-[#4b4b4b] mb-1">{label}</div>
      <div className="text-[24px] font-semibold text-[#212121]">{value}</div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const { format } = useCurrency()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/stats', { auth: true })
      .then(setStats)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Dashboard</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Products" value={stats.totalProducts} to={`${ADMIN_PATH}/products`} />
          <StatCard label="Categories" value={stats.totalCategories} to={`${ADMIN_PATH}/categories`} />
          <StatCard label="Total Orders" value={stats.totalOrders} to={`${ADMIN_PATH}/orders`} />
          <StatCard label="Customers" value={stats.totalUsers} to={`${ADMIN_PATH}/customers`} />
          <StatCard label="Revenue" value={format(stats.totalRevenue)} to={`${ADMIN_PATH}/reports`} />
          <StatCard label="Pending Orders" value={stats.pendingOrders} to={`${ADMIN_PATH}/orders`} />
          <StatCard label="Low Stock (≤5)" value={stats.lowStock} to={`${ADMIN_PATH}/products`} />
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`${ADMIN_PATH}/products/new`}
          className="rounded-md bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-medium px-5 py-2.5 transition-colors"
        >
          + Add Product
        </Link>
        <Link
          to={`${ADMIN_PATH}/categories`}
          className="rounded-md border border-cz-primary text-cz-primary hover:bg-cz-primary hover:text-white text-[14px] font-medium px-5 py-2.5 transition-colors"
        >
          Manage Categories
        </Link>
      </div>
    </div>
  )
}
