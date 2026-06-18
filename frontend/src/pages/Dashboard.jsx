import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import useFetch from '../hooks/useFetch'
import { getDashboard } from '../utils/api'
import { LoadingPage, ErrorMessage } from '../components/UI'

function StatCard({ icon, label, value, color = 'text-white', sub }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium ${color}`}>{sub}</span>
      </div>
      <div className={`stat-value ${color}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function fmt(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + ' mln'
  if (num >= 1_000) return (num / 1_000).toFixed(0) + ' ming'
  return num?.toString() || '0'
}

function fmtSum(num) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(num)) + ' so\'m'
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
}

export default function Dashboard() {
  const { data, loading, error } = useFetch(getDashboard)

  const monthLabels = useMemo(() => {
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
    return (data?.monthly_revenue || []).map((item) => ({
      ...item,
      label: months[parseInt(item.month?.split('-')[1]) - 1] || item.month,
    }))
  }, [data])

  if (loading) return <LoadingPage />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Bosh panel</h1>
        <span className="text-sm text-gray-400">Umumiy ko'rinish</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          label="Umumiy daromad"
          value={fmt(data?.total_revenue || 0)}
          color="text-primary"
          sub="so'm"
        />
        <StatCard
          icon="📦"
          label="Jami buyurtmalar"
          value={data?.total_orders || 0}
          color="text-blue-400"
          sub="ta"
        />
        <StatCard
          icon="👥"
          label="Mijozlar"
          value={data?.total_customers || 0}
          color="text-green-400"
          sub="ta"
        />
        <StatCard
          icon="👔"
          label="Mahsulotlar"
          value={data?.total_products || 0}
          color="text-purple-400"
          sub="ta"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card xl:col-span-2">
          <h3 className="text-base font-display font-semibold text-white mb-4">
            Oylik daromad
          </h3>
          {monthLabels.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthLabels}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ee9624" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ee9624" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="label" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => fmt(v)} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => [fmtSum(v), 'Daromad']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ee9624"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              Ma'lumot yo'q
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card">
          <h3 className="text-base font-display font-semibold text-white mb-4">
            Top mahsulotlar
          </h3>
          {data?.top_products?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.top_products} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#666" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#666"
                  fontSize={10}
                  width={80}
                  tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => [v + ' ta', 'Sotuv']}
                />
                <Bar dataKey="sales" fill="#ee9624" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              Ma'lumot yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
