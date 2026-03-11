import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import cartApi from '../../api/cartApi';
import wishlistApi from '../../api/wishlistApi';
import notificationApi from '../../api/notificationApi';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  Package,
  Bell,
  Search,
  Menu,
  X,
  Heart,
  History,
  Home,
  Info,
  Phone,
  CheckCheck,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  CreditCard,
  XCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin, roleLabel } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const POLLING_INTERVAL = 30000; // 30 giây

  // Debug log
  console.log('Header - Auth State:', { 
    user, 
    isAuthenticated, 
    isAdmin, 
    roleLabel,
    unreadCount,
    wishlistCount,
    cartCount,
    path: location.pathname 
  });

  // Fetch data when component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
      fetchWishlistCount();
      fetchNotifications();
      
      // Polling để cập nhật số lượng thông báo
      const interval = setInterval(() => {
        if (!showNotifications) {
          fetchUnreadCountOnly();
        }
      }, POLLING_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch khi mở dropdown notifications
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const fetchCartCount = async () => {
    try {
      const res = await cartApi.getCart();
      const items = res.data.data?.items || [];
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const res = await wishlistApi.getWishlist();
      setWishlistCount(res.data.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch wishlist count:', error);
    }
  };

  const fetchNotifications = async (force = false) => {
    const now = Date.now();
    
    // Chỉ fetch nếu đã qua interval hoặc force = true
    if (!force && now - lastFetchTime < POLLING_INTERVAL) {
      return;
    }
    
    if (!isAuthenticated || loadingNotifications) return;
    
    setLoadingNotifications(true);
    try {
      const res = await notificationApi.getNotifications();
      
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
        
        // Đếm số chưa đọc
        const unread = res.data.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
        setLastFetchTime(now);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCountOnly = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.data?.data?.count !== undefined) {
        setUnreadCount(res.data.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await notificationApi.deleteNotification(notificationId);
      
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (!deletedNotification?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả thông báo?')) return;
    
    try {
      await notificationApi.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Đã xóa tất cả thông báo');
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_created':
        return <Package className="text-blue-600" size={18} />;
      case 'order_confirmed':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'order_shipped':
        return <Truck className="text-purple-600" size={18} />;
      case 'order_delivered':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'order_cancelled':
        return <XCircle className="text-red-600" size={18} />;
      case 'payment_received':
        return <CreditCard className="text-blue-600" size={18} />;
      case 'low_stock':
        return <AlertCircle className="text-orange-600" size={18} />;
      case 'promotion':
        return <Bell className="text-pink-600" size={18} />;
      default:
        return <Bell className="text-slate-600" size={18} />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'hover:bg-slate-50';
    
    switch (type) {
      case 'order_created':
      case 'order_confirmed':
      case 'order_shipped':
      case 'order_delivered':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'order_cancelled':
        return 'bg-red-50 hover:bg-red-100';
      case 'low_stock':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'promotion':
        return 'bg-pink-50 hover:bg-pink-100';
      default:
        return 'bg-slate-50 hover:bg-slate-100';
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notifDate.toLocaleDateString('vi-VN');
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
    toast.success('Đăng xuất thành công');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { path: '/', label: 'TRANG CHỦ', icon: Home },
    { path: '/search', label: 'SẢN PHẨM', icon: Package },
    { path: '/about', label: 'GIỚI THIỆU', icon: Info },
    { path: '/contact', label: 'LIÊN HỆ', icon: Phone },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Settings className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">
            AUTO<span className="text-blue-600">PARTS</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-bold hover:text-blue-600 transition-colors flex items-center gap-1 ${
                  location.pathname === link.path ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
          
          {/* Admin link */}
          {isAdmin && (
            <Link
              to="/admin"
              className="font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
            >
              <ShieldCheck size={16} />
              QUẢN TRỊ
            </Link>
          )}
        </nav>

        {/* Actions Area */}
        <div className="flex items-center gap-3">
          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-48"
            />
            <button type="submit" className="text-slate-400 hover:text-blue-600">
              <Search size={18} />
            </button>
          </form>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Thông báo"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-2">
                        <Bell size={18} className="text-blue-600" />
                        <h3 className="font-bold">Thông báo</h3>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => fetchNotifications(true)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Làm mới"
                          disabled={loadingNotifications}
                        >
                          <RefreshCw size={16} className={loadingNotifications ? 'animate-spin' : ''} />
                        </button>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Đánh dấu tất cả đã đọc"
                          >
                            <CheckCheck size={16} />
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={deleteAllNotifications}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Xóa tất cả"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="flex justify-center py-8">
                          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            to={`/notifications/${notif.id}`}
                            className={`px-4 py-3 border-b last:border-0 cursor-pointer transition-all block ${
                              getNotificationBgColor(notif.type, notif.is_read)
                            }`}
                            onClick={() => {
                              setShowNotifications(false);
                              if (!notif.is_read) {
                                markAsRead(notif.id);
                              }
                            }}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm ${!notif.is_read ? 'font-bold' : 'font-medium'} line-clamp-2`}>
                                    {notif.title}
                                  </p>
                                  <button
                                    onClick={(e) => deleteNotification(notif.id, e)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock size={12} className="text-slate-400" />
                                  <span className="text-xs text-slate-400">
                                    {formatNotificationTime(notif.created_at)}
                                  </span>
                                  {!notif.is_read && (
                                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                      Mới
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Bell size={40} className="mx-auto text-slate-300 mb-3" />
                          <p className="text-slate-500 font-medium">Không có thông báo</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Thông báo mới sẽ xuất hiện ở đây
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 border-t bg-slate-50 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          Xem tất cả thông báo ({notifications.length})
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative hidden lg:flex p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Yêu thích"
              >
                <Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all"
                  aria-label="Menu người dùng"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                      {user?.full_name || user?.username}
                    </p>
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block border ${
                      isAdmin 
                        ? 'bg-purple-50 text-purple-600 border-purple-200' 
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {roleLabel}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                    {/* User info summary - Mobile only */}
                    <div className="sm:hidden px-4 py-3 border-b">
                      <p className="font-bold">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                      <div className={`mt-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block border ${
                        isAdmin 
                          ? 'bg-purple-50 text-purple-600 border-purple-200' 
                          : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {roleLabel}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <User size={18} />
                      <span className="font-medium">Hồ sơ cá nhân</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <History size={18} />
                      <span className="font-medium">Đơn hàng của tôi</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors lg:hidden"
                    >
                      <Heart size={18} />
                      <span className="font-medium">Yêu thích</span>
                    </Link>

                    <Link
                      to="/notifications"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setShowNotifications(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors lg:hidden relative"
                    >
                      <Bell size={18} />
                      <span className="font-medium">Thông báo</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <LayoutDashboard size={18} />
                          <span className="font-medium">Bảng quản trị</span>
                        </Link>
                      </>
                    )}

                    <div className="h-px bg-slate-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-6 py-2.5 font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                ĐĂNG NHẬP
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
              >
                ĐĂNG KÝ
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1"
              />
              <button type="submit" className="text-slate-400 hover:text-blue-600">
                <Search size={18} />
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold ${
                      location.pathname === link.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-purple-600 hover:bg-purple-50"
                >
                  <ShieldCheck size={18} />
                  QUẢN TRỊ
                </Link>
              )}

              {!isAuthenticated && (
                <div className="border-t pt-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors mb-2"
                  >
                    ĐĂNG NHẬP
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    ĐĂNG KÝ
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;