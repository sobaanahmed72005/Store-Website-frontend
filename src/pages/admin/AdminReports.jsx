import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { api } from '../../api/client'
import { useCurrency } from '../../context/CurrencyContext'
import { ADMIN_PATH } from '../../config/adminPath'

// Dataviz skill's validated default palette, used as-is.
const SEQ_LIGHT = '#9ec5f4'
const SEQ_MAIN = '#3987e5'
const SEQ_DARK = '#0d366b'
const CATEGORICAL = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834']
const STATUS_COLOR = { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b' }
const STATUS_BUCKET = {
  delivered: 'good',
  pending_payment: 'warning',
  pending: 'warning',
  confirmed: 'warning',
  packed: 'warning',
  shipped: 'warning',
  out_for_delivery: 'warning',
  returned: 'critical',
  cancelled: 'critical',
}
const STATUS_LABEL = {
  pending_payment: 'Awaiting Payment',
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
}

const TEXT_SECONDARY = '#4b4b4b'
const TEXT_MUTED = '#898781'
const GRID = '#e1e0d9'

function truncate(str, n) {
  return str && str.length > n ? `${str.slice(0, n - 1)}…` : str
}

function ReportCard({ title, subtitle, action, children }) {
  return (
    <div className="rounded-[10px] bg-white border border-[#dedede] p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#212121]">{title}</h2>
          {subtitle && <p className="text-[12px] text-[#898781] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function EmptyState() {
  return <div className="text-[13px] text-[#898781] py-14 text-center">Not enough data yet.</div>
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex rounded-md border border-[#dedede] overflow-hidden text-[12px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 transition-colors ${
            value === opt.value ? 'bg-cz-primary text-white' : 'bg-white text-[#4b4b4b] hover:bg-[#f5f5f5]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SummaryTile({ label, data, format }) {
  return (
    <div className="rounded-[10px] bg-white border border-[#dedede] p-5">
      <div className="text-[13px] text-[#4b4b4b] mb-1">{label}</div>
      <div className="text-[22px] font-semibold text-[#212121]">{format(data?.revenue ?? 0)}</div>
      <div className="text-[12px] text-[#898781] mt-1">{data?.orders ?? 0} orders</div>
    </div>
  )
}

const currencyTooltipFormatter = (format) => (value, name) => [format(value), name]

export default function AdminReports() {
  const { format } = useCurrency()
  const [error, setError] = useState('')

  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState(null)
  const [trendPeriod, setTrendPeriod] = useState('30d')
  const [topProducts, setTopProducts] = useState(null)
  const [topSortBy, setTopSortBy] = useState('revenue')
  const [bottomProducts, setBottomProducts] = useState(null)
  const [salesByCity, setSalesByCity] = useState(null)
  const [statusBreakdown, setStatusBreakdown] = useState(null)
  const [paymentBreakdown, setPaymentBreakdown] = useState(null)
  const [valueHistogram, setValueHistogram] = useState(null)
  const [saleSplit, setSaleSplit] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/admin/reports/revenue-summary', { auth: true }).then(setSummary),
      api.get('/admin/reports/bottom-products?limit=10', { auth: true }).then(setBottomProducts),
      api.get('/admin/reports/sales-by-city?limit=10', { auth: true }).then(setSalesByCity),
      api.get('/admin/reports/order-status-breakdown', { auth: true }).then(setStatusBreakdown),
      api.get('/admin/reports/payment-method-breakdown', { auth: true }).then(setPaymentBreakdown),
      api.get('/admin/reports/order-value-histogram', { auth: true }).then(setValueHistogram),
      api.get('/admin/reports/sale-split', { auth: true }).then(setSaleSplit),
    ]).catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    api.get(`/admin/reports/revenue-trend?period=${trendPeriod}`, { auth: true })
      .then(setTrend)
      .catch((err) => setError(err.message))
  }, [trendPeriod])

  useEffect(() => {
    api.get(`/admin/reports/top-products?limit=10&by=${topSortBy}`, { auth: true })
      .then(setTopProducts)
      .catch((err) => setError(err.message))
  }, [topSortBy])

  const trendXKey = trendPeriod === '12m' ? 'bucket' : 'bucket'

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-1">
        <Link to={ADMIN_PATH} className="text-[13px] text-cz-primary hover:underline">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-[22px] font-semibold text-[#212121] mb-6">Reports</h1>

      {error && <div className="text-[14px] text-red-600 mb-4">{error}</div>}

      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SummaryTile label="This Week" data={summary?.week} format={format} />
        <SummaryTile label="This Month" data={summary?.month} format={format} />
        <SummaryTile label="This Year" data={summary?.year} format={format} />
        <SummaryTile label="All Time" data={summary?.allTime} format={format} />
      </div>

      {/* Revenue trend */}
      <ReportCard
        title="Revenue Trend"
        subtitle="Excludes cancelled and returned orders"
        action={
          <ToggleGroup
            value={trendPeriod}
            onChange={setTrendPeriod}
            options={[
              { value: '7d', label: 'Weekly' },
              { value: '30d', label: 'Monthly' },
              { value: '12m', label: 'Yearly' },
            ]}
          />
        }
      >
        {!trend ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey={trendXKey} tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={false} width={70}
                     tickFormatter={(v) => format(v)} />
              <Tooltip formatter={currencyTooltipFormatter(format)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke={SEQ_MAIN} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ReportCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Top products */}
        <ReportCard
          title="Top Selling Products"
          action={
            <ToggleGroup
              value={topSortBy}
              onChange={setTopSortBy}
              options={[
                { value: 'revenue', label: 'By Revenue' },
                { value: 'quantity', label: 'By Units' },
              ]}
            />
          }
        >
          {!topProducts || topProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, topProducts.length * 34)}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: GRID }}
                       tickFormatter={(v) => (topSortBy === 'revenue' ? format(v) : v)} />
                <YAxis type="category" dataKey="product_name" width={140} tickFormatter={(v) => truncate(v, 18)}
                       tick={{ fontSize: 11, fill: TEXT_SECONDARY }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => (topSortBy === 'revenue' ? format(value) : value)}
                  labelFormatter={(label) => label}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey={topSortBy === 'revenue' ? 'totalRevenue' : 'totalQuantity'} name={topSortBy === 'revenue' ? 'Revenue' : 'Units sold'}
                     fill={SEQ_MAIN} barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ReportCard>

        {/* Bottom products */}
        <ReportCard title="Worst Selling Products" subtitle="Lowest units sold, includes zero-sale products">
          {!bottomProducts || bottomProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, bottomProducts.length * 34)}>
              <BarChart data={bottomProducts} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: GRID }} />
                <YAxis type="category" dataKey="name" width={140} tickFormatter={(v) => truncate(v, 18)}
                       tick={{ fontSize: 11, fill: TEXT_SECONDARY }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="totalQuantity" name="Units sold" fill={SEQ_LIGHT} barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ReportCard>

        {/* Sales by city */}
        <ReportCard title="Sales by Area" subtitle="Revenue by shipping city">
          {!salesByCity || salesByCity.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(180, salesByCity.length * 34)}>
              <BarChart data={salesByCity} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: GRID }}
                       tickFormatter={(v) => format(v)} />
                <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 11, fill: TEXT_SECONDARY }} tickLine={false} axisLine={false} />
                <Tooltip formatter={currencyTooltipFormatter(format)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="revenue" name="Revenue" fill={SEQ_MAIN} barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ReportCard>

        {/* Order status breakdown */}
        <ReportCard title="Order Status Breakdown">
          {!statusBreakdown || statusBreakdown.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={Math.max(180, statusBreakdown.length * 30)}>
                <BarChart data={statusBreakdown} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: GRID }} />
                  <YAxis type="category" dataKey="status" width={120} tickFormatter={(v) => STATUS_LABEL[v] || v}
                         tick={{ fontSize: 11, fill: TEXT_SECONDARY }} tickLine={false} axisLine={false} />
                  <Tooltip labelFormatter={(v) => STATUS_LABEL[v] || v} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="orders" name="Orders" barSize={16} radius={[0, 4, 4, 0]}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLOR[STATUS_BUCKET[entry.status] || 'warning']} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 text-[12px] text-[#4b4b4b]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR.good }} />Delivered</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR.warning }} />In progress</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR.critical }} />Cancelled / Returned</span>
              </div>
            </>
          )}
        </ReportCard>

        {/* Payment method breakdown */}
        <ReportCard title="Payment Methods" subtitle="Share of revenue by payment method">
          {!paymentBreakdown || paymentBreakdown.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  dataKey="revenue"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {paymentBreakdown.map((entry, i) => (
                    <Cell key={entry.method} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={currencyTooltipFormatter(format)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ReportCard>

        {/* Order value histogram */}
        <ReportCard title="Order Value Distribution" subtitle="How many orders fall in each spend range">
          {!valueHistogram ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={valueHistogram} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={{ stroke: GRID }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: TEXT_MUTED }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="orders" name="Orders" fill={SEQ_MAIN} barSize={36} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ReportCard>
      </div>

      {/* Sale vs regular price split */}
      <ReportCard
        title="Sale vs Regular Price Revenue"
        subtitle="Based on orders placed since this report was added — earlier orders aren't tracked and are excluded"
        action={null}
      >
        {!saleSplit || (Number(saleSplit.saleRevenue) === 0 && Number(saleSplit.regularRevenue) === 0) ? (
          <EmptyState />
        ) : (
          <div>
            <div className="flex w-full h-6 rounded-full overflow-hidden gap-0.5 bg-[#f0efec]">
              {Number(saleSplit.regularRevenue) > 0 && (
                <div
                  style={{
                    width: `${(Number(saleSplit.regularRevenue) / (Number(saleSplit.regularRevenue) + Number(saleSplit.saleRevenue))) * 100}%`,
                    background: SEQ_MAIN,
                  }}
                />
              )}
              {Number(saleSplit.saleRevenue) > 0 && (
                <div
                  style={{
                    width: `${(Number(saleSplit.saleRevenue) / (Number(saleSplit.regularRevenue) + Number(saleSplit.saleRevenue))) * 100}%`,
                    background: CATEGORICAL[2],
                  }}
                />
              )}
            </div>
            <div className="flex items-center gap-6 mt-3 text-[13px]">
              <span className="flex items-center gap-1.5 text-[#4b4b4b]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: SEQ_MAIN }} />
                Regular price — {format(saleSplit.regularRevenue)}
              </span>
              <span className="flex items-center gap-1.5 text-[#4b4b4b]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORICAL[2] }} />
                On sale — {format(saleSplit.saleRevenue)}
              </span>
            </div>
          </div>
        )}
      </ReportCard>
    </div>
  )
}
