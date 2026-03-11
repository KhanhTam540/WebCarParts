import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notificationApi from '../api/notificationApi';
import { 
  Bell, 
  Package, 
  CheckCircle, 
  Truck, 
  XCircle, 
  CreditCard,
  AlertCircle,
  Clock,
  Trash2,
  CheckCheck,
  ArrowLeft,
  Loader,
  Eye
} from 'lucide-react';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchNotifications();
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    
    try {
      await notificationApi.deleteAllNotifications();
      setNotifications([]);
      toast.success('Đã xóa tất cả thông báo');
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
        return <Package className="text-blue-600" size={24} />;
      case 'order_confirmed':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'order_shipped':
        return <Truck className="text-purple-600" size={24} />;
      case 'order_delivered':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'order_cancelled':
        return <XCircle className="text-red-600" size={24} />;
      case 'payment_received':
        return <CreditCard className="text-blue-600" size={24} />;
      case 'low_stock':
        return <AlertCircle className="text-orange-600" size={24} />;
      default:
        return <Bell className="text-slate-600" size={24} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <Bell className="text-blue-600" size={32} />
                THÔNG BÁO
              </h1>
              <p className="text-slate-500 mt-2">
                {unreadCount} thông báo chưa đọc
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckCheck size={18} />
                Đánh dấu đã đọc
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Đã đọc ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center">
            <Bell size={60} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              Không có thông báo
            </h2>
            <p className="text-slate-500">
              {filter === 'unread' 
                ? 'Bạn đã đọc tất cả thông báo'
                : filter === 'read'
                ? 'Chưa có thông báo nào được đánh dấu đã đọc'
                : 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <Link
                key={notif.id}
                to={`/notifications/${notif.id}`}
                className={`block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all ${
                  !notif.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => {
                  if (!notif.is_read) {
                    markAsRead(notif.id);
                  }
                }}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      !notif.is_read ? 'bg-blue-50' : 'bg-slate-50'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`text-lg ${!notif.is_read ? 'font-bold' : 'font-medium'}`}>
                          {notif.title}
                        </h3>
                        <p className="text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            deleteNotification(notif.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <Clock size={14} />
                      <span>{formatDate(notif.created_at)}</span>
                      {notif.is_read ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                          Đã đọc
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                          Chưa đọc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;