import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Loader,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Filter,
  Edit,
  Save,
  Clock,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders();
      setOrders(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.data?.length || 0,
        totalPages: Math.ceil((res.data.data?.length || 0) / prev.limit)
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(orderId, { status });
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      setEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
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

  const getNextStatusOptions = (currentStatus) => {
    const options = {
      'PENDING': [
        { value: 'PAID', label: 'Đã thanh toán', icon: CreditCard, color: 'blue' },
        { value: 'CANCELLED', label: 'Hủy đơn', icon: XCircle, color: 'red' }
      ],
      'PAID': [
        { value: 'SHIPPING', label: 'Đang giao', icon: Truck, color: 'purple' },
        { value: 'CANCELLED', label: 'Hủy đơn', icon: XCircle, color: 'red' }
      ],
      'SHIPPING': [
        { value: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle, color: 'green' },
        { value: 'CANCELLED', label: 'Hủy đơn', icon: XCircle, color: 'red' }
      ],
      'COMPLETED': [],
      'CANCELLED': []
    };
    return options[currentStatus] || [];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toString().includes(searchTerm) ||
      order.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
          <ShoppingBag className="text-blue-600" />
          QUẢN LÝ ĐƠN HÀNG
        </h1>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold">
            Tổng: {orders.length} đơn
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
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

          {/* Filter button */}
          <button
            onClick={() => {
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchOrders();
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Filter size={18} />
            LỌC
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-6 py-4 font-medium">Mã đơn</th>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Ngày đặt</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-blue-600">
                      #{order.id}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.full_name || order.username}</p>
                      <p className="text-xs text-slate-400">{order.email}</p>
                      {order.phone && (
                        <p className="text-xs text-slate-400 mt-1">{order.phone}</p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(order.order_date)}
                  </td>
                  
                  <td className="px-6 py-4 font-black text-orange-600">
                    {formatCurrency(order.total_amount)}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        disabled={updating}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50`}
                      >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="SHIPPING">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                      {getStatusIcon(order.status)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setShowOrderModal(true);
                      }}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, filteredOrders.length)} / {filteredOrders.length} đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            
            {pagination.totalPages > 0 && [...Array(pagination.totalPages)].map((_, i) => {
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
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setEditingStatus(false);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Update Section */}
              <div className="bg-slate-50 p-6 rounded-2xl mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Trạng thái hiện tại</p>
                      <p className="text-lg font-bold">{getStatusText(selectedOrder.status)}</p>
                    </div>
                  </div>

                  {!editingStatus ? (
                    <button
                      onClick={() => setEditingStatus(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Edit size={16} />
                      Cập nhật trạng thái
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="px-4 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="SHIPPING">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, newStatus)}
                        disabled={updating || newStatus === selectedOrder.status}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updating ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setEditingStatus(false);
                          setNewStatus(selectedOrder.status);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {/* Next Status Suggestions */}
                {!editingStatus && getNextStatusOptions(selectedOrder.status).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <p className="text-sm text-slate-500 mb-3">Cập nhật nhanh:</p>
                    <div className="flex gap-2">
                      {getNextStatusOptions(selectedOrder.status).map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleUpdateStatus(selectedOrder.id, option.value)}
                            disabled={updating}
                            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors ${
                              option.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                              option.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                              option.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <Icon size={16} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Customer info */}
                <div>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Package size={18} className="text-blue-600" />
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-2 text-slate-600">
                    <p><span className="text-slate-400">Tên:</span> {selectedOrder.full_name || selectedOrder.username}</p>
                    <p><span className="text-slate-400">Email:</span> {selectedOrder.email}</p>
                    <p><span className="text-slate-400">Điện thoại:</span> {selectedOrder.phone || 'N/A'}</p>
                    <p><span className="text-slate-400">Địa chỉ:</span> {selectedOrder.address || 'N/A'}</p>
                  </div>
                </div>

                {/* Order info */}
                <div>
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    Thông tin đơn hàng
                  </h3>
                  <div className="space-y-2 text-slate-600">
                    <p><span className="text-slate-400">Ngày đặt:</span> {formatDate(selectedOrder.order_date)}</p>
                    <p><span className="text-slate-400">Phương thức TT:</span> COD</p>
                    <p>
                      <span className="text-slate-400">Trạng thái:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Order items */}
              <h3 className="font-bold mb-4">Sản phẩm đã đặt</h3>
              <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=100'}
                      className="w-20 h-20 rounded-xl object-cover"
                      alt={item.part_name}
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.part_name}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Số lượng: {item.quantity} x {formatCurrency(item.price_at_purchase)}
                      </p>
                    </div>
                    <p className="font-black text-orange-600">
                      {formatCurrency(item.quantity * item.price_at_purchase)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order total */}
              <div className="border-t pt-6">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-black text-orange-600">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t">
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setEditingStatus(false);
                  }}
                  className="px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                  In đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;