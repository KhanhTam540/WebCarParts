import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderApi from '../api/orderApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  Calendar,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchOrders();
  }, [isAuthenticated, pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders();
      setOrders(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.data?.length || 0,
        totalPages: Math.ceil((res.data.data?.length || 0) / prev.limit)
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PAID': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHIPPING': 'bg-purple-100 text-purple-800 border-purple-200',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} />;
      case 'PAID':
        return <CreditCard size={16} />;
      case 'SHIPPING':
        return <Truck size={16} />;
      case 'COMPLETED':
        return <CheckCircle size={16} />;
      case 'CANCELLED':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xác nhận',
      'PAID': 'Đã thanh toán',
      'SHIPPING': 'Đang giao hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return texts[status] || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      order.total_amount.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = (!dateRange.start_date || new Date(order.order_date) >= new Date(dateRange.start_date)) &&
                       (!dateRange.end_date || new Date(order.order_date) <= new Date(dateRange.end_date));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedOrders = filteredOrders.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Package className="text-blue-600" size={32} />
              LỊCH SỬ ĐẶT HÀNG
            </h1>
            <p className="text-slate-500 mt-2">
              Quản lý và theo dõi tất cả đơn hàng của bạn
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            MUA SẮM TIẾP
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>

            {/* Date range */}
            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Từ ngày"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Đến ngày"
              />
            </div>
          </div>
        </div>

        {/* Orders list */}
        {paginatedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center">
            <div className="text-slate-300 text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-slate-500 mb-8">Hãy mua sắm để có đơn hàng đầu tiên</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Order ID */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Mã đơn hàng</p>
                      <p className="font-mono font-bold text-slate-800 text-lg">#{order.id}</p>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div>
                    <p className="text-sm text-slate-400">Ngày đặt</p>
                    <p className="font-medium text-slate-700 flex items-center gap-1">
                      <Calendar size={16} className="text-slate-400" />
                      {formatDate(order.order_date)}
                    </p>
                  </div>
                  
                  {/* Total */}
                  <div>
                    <p className="text-sm text-slate-400">Tổng tiền</p>
                    <p className="font-black text-orange-600 text-xl">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Trạng thái</p>
                    <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  {/* Arrow */}
                  <ChevronRight className="text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                </div>

                {/* Summary */}
                {order.items && (
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <p className="text-sm text-slate-500">
                      {order.items.length} sản phẩm · 
                      <span className="ml-1">
                        {order.items.map(item => item.part_name).join(', ').substring(0, 100)}
                        {order.items.length > 3 ? '...' : ''}
                      </span>
                    </p>
                  </div>
                )}
              </Link>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current"
                >
                  ←
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-xl ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 hover:bg-slate-100'
                        } transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === pagination.page - 3 || pageNum === pagination.page + 3) {
                    return <span key={pageNum} className="text-slate-400">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Statistics summary */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-slate-400">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-slate-800">{orders.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-slate-400">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-slate-400">Đang xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => ['PENDING', 'PAID', 'SHIPPING'].includes(o.status)).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-slate-400">Đã hủy</p>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'CANCELLED').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;