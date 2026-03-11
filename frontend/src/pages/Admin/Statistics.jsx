import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  ShoppingBag,
  Calendar,
  Download,
  Filter,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  PieChart,
  Activity,
  UserCheck,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState('day');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDetailedStats();
  }, [dateRange, groupBy]);

  const fetchDetailedStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDetailedStatistics({
        ...dateRange,
        group_by: groupBy
      });
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    toast.success(`Đang xuất báo cáo ${type === 'excel' ? 'Excel' : 'PDF'}...`);
  };

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'revenue', label: 'Doanh thu', icon: DollarSign },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'time', label: 'Thời gian', icon: Clock },
  ];

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-blue-600" />
            Thống kê chi tiết
          </h1>
          <p className="text-slate-500 mt-1">
            {stats.period.start_date} → {stats.period.end_date}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
            <Calendar size={18} className="text-slate-400 ml-2" />
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-2 py-1.5 text-sm border-0 focus:outline-none"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-2 py-1.5 text-sm border-0 focus:outline-none"
            />
          </div>

          {/* Group by */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>

          {/* Export buttons */}
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
              <DollarSign size={32} className="mb-4" />
              <p className="text-sm opacity-90 mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.summary.total_revenue)}</p>
              <p className="text-xs opacity-75 mt-2">{stats.summary.total_orders} đơn hàng</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
              <ShoppingBag size={32} className="mb-4" />
              <p className="text-sm opacity-90 mb-1">Giá trị trung bình</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.summary.avg_order_value)}</p>
              <p className="text-xs opacity-75 mt-2">/đơn hàng</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
              <Target size={32} className="mb-4" />
              <p className="text-sm opacity-90 mb-1">Đơn hàng lớn nhất</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.summary.max_order)}</p>
              <p className="text-xs opacity-75 mt-2">Nhỏ nhất: {formatCurrency(stats.summary.min_order)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white">
              <UserCheck size={32} className="mb-4" />
              <p className="text-sm opacity-90 mb-1">Tỷ lệ chuyển đổi</p>
              <p className="text-3xl font-bold">{stats.conversion_rate.rate}%</p>
              <p className="text-xs opacity-75 mt-2">
                {stats.conversion_rate.buyers} / {stats.conversion_rate.total_users} khách
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Doanh thu theo thời gian
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenue_by_time}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} stroke="#94a3b8" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Kỳ: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    name="Doanh thu"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">Thống kê theo danh mục</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-medium">Danh mục</th>
                    <th className="px-4 py-3 font-medium text-right">Số SP</th>
                    <th className="px-4 py-3 font-medium text-right">Đơn hàng</th>
                    <th className="px-4 py-3 font-medium text-right">SL bán</th>
                    <th className="px-4 py-3 font-medium text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.category_stats.map((cat, index) => (
                    <tr key={cat.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 text-right">{cat.product_count}</td>
                      <td className="px-4 py-3 text-right">{cat.order_count || 0}</td>
                      <td className="px-4 py-3 text-right">{cat.items_sold}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {formatCurrency(cat.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue by Time */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">Chi tiết doanh thu</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-medium">Kỳ</th>
                    <th className="px-4 py-3 font-medium text-right">Số đơn</th>
                    <th className="px-4 py-3 font-medium text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.revenue_by_time.map((item, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">{item.period}</td>
                      <td className="px-4 py-3 text-right">{item.order_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">Top 10 sản phẩm bán chạy</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium">Danh mục</th>
                    <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                    <th className="px-4 py-3 font-medium text-right">SL bán</th>
                    <th className="px-4 py-3 font-medium text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_products.map((product, index) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-slate-500">{product.category_name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{product.total_sold}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {formatCurrency(product.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">Thống kê tất cả sản phẩm</h2>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium">Danh mục</th>
                    <th className="px-4 py-3 font-medium text-right">SL đơn</th>
                    <th className="px-4 py-3 font-medium text-right">SL bán</th>
                    <th className="px-4 py-3 font-medium text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.product_stats.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-slate-500">{product.category_name}</td>
                      <td className="px-4 py-3 text-right">{product.order_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{product.total_quantity || 0}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {formatCurrency(product.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Top Customers */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">Khách hàng thân thiết</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Khách hàng</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium text-right">Số đơn</th>
                    <th className="px-4 py-3 font-medium text-right">Tổng chi</th>
                    <th className="px-4 py-3 font-medium text-right">TB đơn</th>
                    <th className="px-4 py-3 font-medium">Gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.customer_stats.map((customer, index) => (
                    <tr key={customer.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{customer.full_name || customer.username}</td>
                      <td className="px-4 py-3 text-slate-500">{customer.email}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{customer.order_count}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">{formatCurrency(customer.total_spent)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(customer.avg_order_value)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(customer.last_order_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6">Khách hàng mới</h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.new_customers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Số lượng" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hourly Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock className="text-blue-600" />
              Theo giờ trong ngày
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourly_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#f97316" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'order_count' ? value : formatCurrency(value),
                      name === 'order_count' ? 'Số đơn' : 'Doanh thu'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="order_count" fill="#3b82f6" name="Số đơn" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="#f97316" name="Doanh thu" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekday Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calendar className="text-blue-600" />
              Theo ngày trong tuần
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weekday_stats.map(item => ({
                  ...item,
                  weekday: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][item.weekday - 1]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="weekday" stroke="#94a3b8" />
                  <YAxis yAxisId="left" stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'order_count' ? value : formatCurrency(value),
                      name === 'order_count' ? 'Số đơn' : 'Doanh thu'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="order_count" fill="#8b5cf6" name="Số đơn" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Doanh thu" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;