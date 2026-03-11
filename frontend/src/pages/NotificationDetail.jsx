import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notificationApi from '../api/notificationApi';
import { 
  Bell, 
  ArrowLeft, 
  Clock, 
  Package, 
  CheckCircle, 
  Truck, 
  XCircle, 
  CreditCard,
  AlertCircle,
  Loader,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchNotification();
  }, [id, isAuthenticated]);

  const fetchNotification = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotificationById(id);
      setNotification(res.data.data);
      
      // Nếu thông báo có liên quan đến đơn hàng, fetch thêm chi tiết đơn hàng
      if (res.data.data.data?.orderId) {
        fetchOrderDetails(res.data.data.data.orderId);
      }
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      toast.error('Không tìm thấy thông báo');
      navigate('/notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      // Giả sử bạn có API lấy chi tiết đơn hàng
      // const res = await orderApi.getOrderById(orderId);
      // setOrderDetails(res.data.data);
      
      // Tạm thời dùng dữ liệu mẫu
      setOrderDetails({
        id: orderId,
        total_amount: 1500000,
        status: 'COMPLETED',
        items: [
          { name: 'Ắc quy Varta 12V 60Ah', quantity: 1, price: 1500000 }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
        return <Package className="text-blue-600" size={32} />;
      case 'order_confirmed':
        return <CheckCircle className="text-green-600" size={32} />;
      case 'order_shipped':
        return <Truck className="text-purple-600" size={32} />;
      case 'order_delivered':
        return <CheckCircle className="text-green-600" size={32} />;
      case 'order_cancelled':
        return <XCircle className="text-red-600" size={32} />;
      case 'payment_received':
        return <CreditCard className="text-blue-600" size={32} />;
      case 'low_stock':
        return <AlertCircle className="text-orange-600" size={32} />;
      default:
        return <Bell className="text-slate-600" size={32} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-blue-100 text-blue-800',
      'SHIPPING': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xác nhận',
      'PAID': 'Đã thanh toán',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (!notification) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </button>

        {/* Notification detail */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 ${!notification.is_read ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-slate-50'}`}>
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                !notification.is_read ? 'bg-white' : 'bg-slate-200'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {notification.title}
                  </h1>
                  {!notification.is_read && (
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      Mới
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatDate(notification.created_at)}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <Bell size={16} />
                    <span className="capitalize">{notification.type?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed">
                {notification.message}
              </p>
            </div>

            {/* Related order information */}
            {notification.data?.orderId && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Thông tin đơn hàng #{notification.data.orderId}
                </h3>
                
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  {/* Order status */}
                  {notification.data.oldStatus && notification.data.newStatus && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Trạng thái cũ</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(notification.data.oldStatus)}`}>
                          {getStatusText(notification.data.oldStatus)}
                        </span>
                      </div>
                      <ArrowLeft size={20} className="text-slate-400 rotate-180" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-1">Trạng thái mới</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(notification.data.newStatus)}`}>
                          {getStatusText(notification.data.newStatus)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Order details if available */}
                  {orderDetails && (
                    <>
                      {/* Order summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-sm text-slate-400 mb-1">Tổng tiền</p>
                          <p className="text-xl font-bold text-orange-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderDetails.total_amount)}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl">
                          <p className="text-sm text-slate-400 mb-1">Trạng thái</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                            {getStatusText(orderDetails.status)}
                          </span>
                        </div>
                      </div>

                      {/* Order items */}
                      {orderDetails.items && orderDetails.items.length > 0 && (
                        <div>
                          <p className="font-medium text-slate-700 mb-3">Sản phẩm đã đặt:</p>
                          <div className="space-y-3">
                            {orderDetails.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-slate-600">
                                  {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
              {notification.data?.orderId && (
                <Link
                  to={`/orders/${notification.data.orderId}`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Package size={18} />
                  Xem chi tiết đơn hàng
                </Link>
              )}
              <button
                onClick={() => navigate('/notifications')}
                className="px-6 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;