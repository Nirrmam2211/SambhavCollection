import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = {
  placed: '#b8922a', confirmed: '#1d9e75', in_tailoring: '#378add',
  dispatched: '#7f77dd', delivered: '#3b6d11', cancelled: '#e24b4a',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, recentOrders, ordersByStatus, topProducts, revenueByMonth } = data || {};

  const chartData = revenueByMonth?.map(m => ({
    name: MONTH_NAMES[m._id.month],
    revenue: Math.round(m.revenue),
    orders: m.orders,
  })) || [];

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.revenue?.total || 0).toLocaleString()}`, sub: `₹${(stats?.revenue?.thisMonth || 0).toLocaleString()} this month` },
    { label: 'Total Orders', value: stats?.orders?.total || 0, sub: `${stats?.orders?.thisMonth || 0} this month (${stats?.orders?.growth || 0}% growth)` },
    { label: 'Customers', value: stats?.users?.total || 0, sub: `${stats?.users?.newThisMonth || 0} joined this month` },
    { label: 'Pending Appts', value: stats?.appointments?.pending || 0, sub: 'Awaiting confirmation' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-ink mb-1">Dashboard Overview</h2>
        <p className="text-sm text-muted">Welcome back. Here's what's happening at Sambhav today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-sm p-5">
            <p className="text-xs tracking-widest uppercase text-muted mb-2">{s.label}</p>
            <p className="font-serif text-2xl text-ink mb-1">{s.value}</p>
            <p className="text-xs text-muted/60">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-100 rounded-sm p-6">
        <h3 className="font-serif text-lg text-ink mb-6">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b8922a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#b8922a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9a9189' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9a9189' }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ fontFamily: 'Jost', fontSize: 12, border: '1px solid #b8922a', borderRadius: 0, background: '#0a0a0a', color: '#f7f2eb' }}
              formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#b8922a" strokeWidth={1.5} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white border border-gray-100 rounded-sm p-6">
          <h3 className="font-serif text-lg text-ink mb-6">Orders by Status</h3>
          <div className="space-y-3">
            {ordersByStatus?.map(s => (
              <div key={s._id} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s._id] || '#888' }} />
                <span className="text-xs tracking-wide capitalize flex-1 text-muted">{s._id?.replace(/_/g, ' ')}</span>
                <span className="font-serif text-base text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-gray-100 rounded-sm p-6">
          <h3 className="font-serif text-lg text-ink mb-6">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="font-serif text-xl text-gold/40 w-6 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.totalSold} sold</p>
                </div>
                <span className="text-sm font-medium text-ink shrink-0">₹{p.revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-100 rounded-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg text-ink">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs tracking-widest uppercase text-gold hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Order #', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs tracking-widest uppercase text-muted pb-3 pr-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.map(order => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gold">{order.orderNumber}</td>
                  <td className="py-3 pr-4 text-ink">{order.user?.name}</td>
                  <td className="py-3 pr-4 font-serif text-ink">₹{order.pricing?.total?.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-1 tracking-wide capitalize"
                      style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status] }}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-muted text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
