import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Globe,
  DollarSign,
  Bell,
  Mail,
  Shield,
  Lock,
  Eye,
  Moon,
  Sun,
  Monitor,
  Package,
  Truck,
  Loader,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // State lưu cài đặt
  const [settings, setSettings] = useState({
    // Cài đặt chung
    general: {
      site_name: 'AutoParts',
      site_description: 'Hệ thống phân phối phụ tùng ô tô chính hãng',
      contact_email: 'support@autoparts.vn',
      contact_phone: '1900 1234',
      address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
      working_hours: '8:00 - 22:00',
      timezone: 'Asia/Ho_Chi_Minh',
      date_format: 'dd/mm/yyyy',
      language: 'vi'
    },
    
    // Cài đặt giao diện
    appearance: {
      theme: 'light',
      primary_color: '#3b82f6',
      sidebar_collapsed: false,
      animations: true,
      compact_mode: false,
      show_logo: true
    },
    
    // Cài đặt thông báo
    notifications: {
      email_notifications: true,
      order_confirmation: true,
      order_shipped: true,
      order_delivered: true,
      order_cancelled: true,
      low_stock_alert: true,
      new_user_registration: true,
      new_order_alert: true,
      daily_summary: false,
      weekly_report: true,
      monthly_report: true
    },
    
    // Cài đặt thanh toán
    payment: {
      cod_enabled: true,
      bank_transfer_enabled: true,
      momo_enabled: false,
      vnpay_enabled: false,
      default_method: 'cod',
      tax_rate: 10,
      shipping_fee: 30000,
      free_shipping_threshold: 500000
    },
    
    // Cài đặt bảo mật
    security: {
      two_factor_auth: false,
      session_timeout: 30,
      password_expiry: 90,
      max_login_attempts: 5,
      captcha_enabled: true,
      ssl_enabled: true,
      backup_enabled: true,
      backup_frequency: 'daily',
      maintenance_mode: false
    },
    
    // Cài đặt SEO
    seo: {
      meta_title: 'AutoParts - Phụ tùng ô tô chính hãng',
      meta_description: 'Hệ thống phân phối phụ tùng ô tô chính hãng hàng đầu Việt Nam',
      meta_keywords: 'phụ tùng ô tô, auto parts, phụ tùng chính hãng',
      google_analytics_id: '',
      facebook_pixel_id: '',
      sitemap_enabled: true
    },
    
    // Cài đặt email
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_secure: true,
      smtp_user: 'noreply@autoparts.vn',
      smtp_pass: '********',
      from_email: 'noreply@autoparts.vn',
      from_name: 'AutoParts'
    },
    
    // Cài đặt đơn hàng
    orders: {
      auto_confirm: false,
      auto_cancel_unpaid: true,
      unpaid_timeout: 24,
      min_order_amount: 0,
      max_order_amount: 100000000,
      allow_guest_checkout: false,
      order_prefix: 'ORD',
      invoice_prefix: 'INV'
    },
    
    // Cài đặt sản phẩm
    products: {
      low_stock_threshold: 5,
      out_of_stock_threshold: 0,
      allow_backorder: false,
      show_out_of_stock: true,
      reviews_enabled: true,
      auto_approve_reviews: false,
      related_products_limit: 6,
      products_per_page: 12
    },
    
    // Cài đặt vận chuyển
    shipping: {
      default_method: 'standard',
      methods: [
        { id: 'standard', name: 'Giao hàng tiêu chuẩn', price: 30000, days: '3-5' },
        { id: 'express', name: 'Giao hàng nhanh', price: 50000, days: '1-2' },
        { id: 'free', name: 'Miễn phí vận chuyển', price: 0, days: '5-7', min_order: 500000 }
      ],
      international_shipping: false
    }
  });

  // Danh sách tabs
  const tabs = [
    { id: 'general', label: 'Chung', icon: SettingsIcon },
    { id: 'appearance', label: 'Giao diện', icon: Eye },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'payment', label: 'Thanh toán', icon: DollarSign },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'orders', label: 'Đơn hàng', icon: Package },
    { id: 'products', label: 'Sản phẩm', icon: Package },
    { id: 'shipping', label: 'Vận chuyển', icon: Truck }
  ];

  // Xử lý thay đổi input
  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSaved(false);
  };

  // Xử lý lưu cài đặt
  const handleSave = async () => {
    setLoading(true);
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Lưu vào localStorage để demo
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      
      setSaved(true);
      toast.success('Lưu cài đặt thành công');
      
      // Ẩn thông báo saved sau 3 giây
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error('Lưu cài đặt thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khôi phục mặc định
  const handleReset = () => {
    if (confirm('Bạn có chắc muốn khôi phục cài đặt mặc định?')) {
      // Reset về giá trị mặc định
      window.location.reload();
    }
  };

  // Load settings từ localStorage khi component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Render tab Chung
  const renderGeneral = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Thông tin chung</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tên trang web
          </label>
          <input
            type="text"
            value={settings.general.site_name}
            onChange={(e) => handleChange('general', 'site_name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Mô tả trang web
          </label>
          <input
            type="text"
            value={settings.general.site_description}
            onChange={(e) => handleChange('general', 'site_description', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email liên hệ
          </label>
          <input
            type="email"
            value={settings.general.contact_email}
            onChange={(e) => handleChange('general', 'contact_email', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Số điện thoại
          </label>
          <input
            type="text"
            value={settings.general.contact_phone}
            onChange={(e) => handleChange('general', 'contact_phone', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Địa chỉ
          </label>
          <input
            type="text"
            value={settings.general.address}
            onChange={(e) => handleChange('general', 'address', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Giờ làm việc
          </label>
          <input
            type="text"
            value={settings.general.working_hours}
            onChange={(e) => handleChange('general', 'working_hours', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Múi giờ
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleChange('general', 'timezone', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
            <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
            <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Định dạng ngày
          </label>
          <select
            value={settings.general.date_format}
            onChange={(e) => handleChange('general', 'date_format', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dd/mm/yyyy">dd/mm/yyyy</option>
            <option value="mm/dd/yyyy">mm/dd/yyyy</option>
            <option value="yyyy-mm-dd">yyyy-mm-dd</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ngôn ngữ
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => handleChange('general', 'language', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Render tab Giao diện
  const renderAppearance = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Giao diện</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Chủ đề
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.appearance.theme === 'light'}
                onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <Sun size={18} className="text-yellow-500" />
              <span>Sáng</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.appearance.theme === 'dark'}
                onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <Moon size={18} className="text-slate-700" />
              <span>Tối</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={settings.appearance.theme === 'system'}
                onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <Monitor size={18} className="text-slate-500" />
              <span>Hệ thống</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Màu chủ đạo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.appearance.primary_color}
              onChange={(e) => handleChange('appearance', 'primary_color', e.target.value)}
              className="w-10 h-10 rounded-lg border cursor-pointer"
            />
            <input
              type="text"
              value={settings.appearance.primary_color}
              onChange={(e) => handleChange('appearance', 'primary_color', e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.appearance.sidebar_collapsed}
                onChange={(e) => handleChange('appearance', 'sidebar_collapsed', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Thu gọn sidebar</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.appearance.animations}
                onChange={(e) => handleChange('appearance', 'animations', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Bật hiệu ứng động</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.appearance.compact_mode}
                onChange={(e) => handleChange('appearance', 'compact_mode', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Chế độ thu gọn</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.appearance.show_logo}
                onChange={(e) => handleChange('appearance', 'show_logo', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">Hiển thị logo</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tab Thông báo
  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt thông báo</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Thông báo qua email</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.email_notifications}
              onChange={(e) => handleChange('notifications', 'email_notifications', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Bật thông báo email</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.order_confirmation}
              onChange={(e) => handleChange('notifications', 'order_confirmation', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Xác nhận đơn hàng</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.order_shipped}
              onChange={(e) => handleChange('notifications', 'order_shipped', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Đơn hàng đang giao</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.order_delivered}
              onChange={(e) => handleChange('notifications', 'order_delivered', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Đơn hàng đã giao</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.order_cancelled}
              onChange={(e) => handleChange('notifications', 'order_cancelled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Đơn hàng bị hủy</span>
          </label>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Cảnh báo</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.low_stock_alert}
              onChange={(e) => handleChange('notifications', 'low_stock_alert', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Cảnh báo tồn kho thấp</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.new_user_registration}
              onChange={(e) => handleChange('notifications', 'new_user_registration', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Người dùng mới</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.new_order_alert}
              onChange={(e) => handleChange('notifications', 'new_order_alert', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Đơn hàng mới</span>
          </label>
        </div>
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-medium text-slate-700">Báo cáo định kỳ</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.daily_summary}
              onChange={(e) => handleChange('notifications', 'daily_summary', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Báo cáo hàng ngày</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.weekly_report}
              onChange={(e) => handleChange('notifications', 'weekly_report', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Báo cáo hàng tuần</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.notifications.monthly_report}
              onChange={(e) => handleChange('notifications', 'monthly_report', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Báo cáo hàng tháng</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render tab Thanh toán
  const renderPayment = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt thanh toán</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Phương thức thanh toán</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.payment.cod_enabled}
              onChange={(e) => handleChange('payment', 'cod_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.payment.bank_transfer_enabled}
              onChange={(e) => handleChange('payment', 'bank_transfer_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Chuyển khoản ngân hàng</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.payment.momo_enabled}
              onChange={(e) => handleChange('payment', 'momo_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Ví MoMo</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.payment.vnpay_enabled}
              onChange={(e) => handleChange('payment', 'vnpay_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">VNPay</span>
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phương thức mặc định
            </label>
            <select
              value={settings.payment.default_method}
              onChange={(e) => handleChange('payment', 'default_method', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cod">COD</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="momo">MoMo</option>
              <option value="vnpay">VNPay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thuế VAT (%)
            </label>
            <input
              type="number"
              value={settings.payment.tax_rate}
              onChange={(e) => handleChange('payment', 'tax_rate', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phí vận chuyển (₫)
            </label>
            <input
              type="number"
              value={settings.payment.shipping_fee}
              onChange={(e) => handleChange('payment', 'shipping_fee', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Miễn phí vận chuyển cho đơn từ (₫)
            </label>
            <input
              type="number"
              value={settings.payment.free_shipping_threshold}
              onChange={(e) => handleChange('payment', 'free_shipping_threshold', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render tab Bảo mật
  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt bảo mật</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.two_factor_auth}
              onChange={(e) => handleChange('security', 'two_factor_auth', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Bật xác thực 2 yếu tố</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.captcha_enabled}
              onChange={(e) => handleChange('security', 'captcha_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Bật Captcha</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.ssl_enabled}
              onChange={(e) => handleChange('security', 'ssl_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Bắt buộc HTTPS</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.backup_enabled}
              onChange={(e) => handleChange('security', 'backup_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Tự động sao lưu</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.security.maintenance_mode}
              onChange={(e) => handleChange('security', 'maintenance_mode', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-orange-600">Chế độ bảo trì</span>
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian session (phút)
            </label>
            <input
              type="number"
              value={settings.security.session_timeout}
              onChange={(e) => handleChange('security', 'session_timeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời hạn mật khẩu (ngày)
            </label>
            <input
              type="number"
              value={settings.security.password_expiry}
              onChange={(e) => handleChange('security', 'password_expiry', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số lần đăng nhập sai tối đa
            </label>
            <input
              type="number"
              value={settings.security.max_login_attempts}
              onChange={(e) => handleChange('security', 'max_login_attempts', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tần suất sao lưu
            </label>
            <select
              value={settings.security.backup_frequency}
              onChange={(e) => handleChange('security', 'backup_frequency', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tab SEO
  const renderSEO = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt SEO</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            value={settings.seo.meta_title}
            onChange={(e) => handleChange('seo', 'meta_title', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Meta Description
          </label>
          <textarea
            value={settings.seo.meta_description}
            onChange={(e) => handleChange('seo', 'meta_description', e.target.value)}
            rows="3"
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Meta Keywords
          </label>
          <input
            type="text"
            value={settings.seo.meta_keywords}
            onChange={(e) => handleChange('seo', 'meta_keywords', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={settings.seo.google_analytics_id}
            onChange={(e) => handleChange('seo', 'google_analytics_id', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="UA-XXXXX-Y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Facebook Pixel ID
          </label>
          <input
            type="text"
            value={settings.seo.facebook_pixel_id}
            onChange={(e) => handleChange('seo', 'facebook_pixel_id', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.seo.sitemap_enabled}
            onChange={(e) => handleChange('seo', 'sitemap_enabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm">Tự động tạo sitemap</span>
        </label>
      </div>
    </div>
  );

  // Render tab Email
  const renderEmail = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cấu hình email</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.email.smtp_host}
            onChange={(e) => handleChange('email', 'smtp_host', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.email.smtp_port}
            onChange={(e) => handleChange('email', 'smtp_port', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            SMTP Username
          </label>
          <input
            type="text"
            value={settings.email.smtp_user}
            onChange={(e) => handleChange('email', 'smtp_user', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            SMTP Password
          </label>
          <input
            type="password"
            value={settings.email.smtp_pass}
            onChange={(e) => handleChange('email', 'smtp_pass', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email gửi đi
          </label>
          <input
            type="email"
            value={settings.email.from_email}
            onChange={(e) => handleChange('email', 'from_email', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tên người gửi
          </label>
          <input
            type="text"
            value={settings.email.from_name}
            onChange={(e) => handleChange('email', 'from_name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.email.smtp_secure}
              onChange={(e) => handleChange('email', 'smtp_secure', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Sử dụng SSL/TLS</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render tab Đơn hàng
  const renderOrders = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt đơn hàng</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.orders.auto_confirm}
              onChange={(e) => handleChange('orders', 'auto_confirm', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Tự động xác nhận đơn hàng</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.orders.auto_cancel_unpaid}
              onChange={(e) => handleChange('orders', 'auto_cancel_unpaid', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Tự động hủy đơn chưa thanh toán</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.orders.allow_guest_checkout}
              onChange={(e) => handleChange('orders', 'allow_guest_checkout', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Cho phép thanh toán không cần đăng nhập</span>
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian hủy đơn (giờ)
            </label>
            <input
              type="number"
              value={settings.orders.unpaid_timeout}
              onChange={(e) => handleChange('orders', 'unpaid_timeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giá trị đơn hàng tối thiểu (₫)
            </label>
            <input
              type="number"
              value={settings.orders.min_order_amount}
              onChange={(e) => handleChange('orders', 'min_order_amount', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giá trị đơn hàng tối đa (₫)
            </label>
            <input
              type="number"
              value={settings.orders.max_order_amount}
              onChange={(e) => handleChange('orders', 'max_order_amount', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tiền tố đơn hàng
            </label>
            <input
              type="text"
              value={settings.orders.order_prefix}
              onChange={(e) => handleChange('orders', 'order_prefix', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render tab Sản phẩm
  const renderProducts = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt sản phẩm</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ngưỡng tồn kho thấp
            </label>
            <input
              type="number"
              value={settings.products.low_stock_threshold}
              onChange={(e) => handleChange('products', 'low_stock_threshold', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ngưỡng hết hàng
            </label>
            <input
              type="number"
              value={settings.products.out_of_stock_threshold}
              onChange={(e) => handleChange('products', 'out_of_stock_threshold', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số sản phẩm liên quan
            </label>
            <input
              type="number"
              value={settings.products.related_products_limit}
              onChange={(e) => handleChange('products', 'related_products_limit', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số sản phẩm mỗi trang
            </label>
            <input
              type="number"
              value={settings.products.products_per_page}
              onChange={(e) => handleChange('products', 'products_per_page', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.products.allow_backorder}
              onChange={(e) => handleChange('products', 'allow_backorder', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Cho phép đặt hàng khi hết</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.products.show_out_of_stock}
              onChange={(e) => handleChange('products', 'show_out_of_stock', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Hiển thị sản phẩm hết hàng</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.products.reviews_enabled}
              onChange={(e) => handleChange('products', 'reviews_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Bật đánh giá sản phẩm</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.products.auto_approve_reviews}
              onChange={(e) => handleChange('products', 'auto_approve_reviews', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Tự động duyệt đánh giá</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render tab Vận chuyển
  const renderShipping = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold mb-4">Cài đặt vận chuyển</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phương thức vận chuyển mặc định
          </label>
          <select
            value={settings.shipping.default_method}
            onChange={(e) => handleChange('shipping', 'default_method', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            {settings.shipping.methods.map(method => (
              <option key={method.id} value={method.id}>{method.name}</option>
            ))}
          </select>
        </div>

        <div>
          <h4 className="font-medium text-slate-700 mb-3">Các phương thức vận chuyển</h4>
          {settings.shipping.methods.map((method, index) => (
            <div key={method.id} className="bg-slate-50 p-4 rounded-xl mb-3">
              <div className="grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={method.name}
                  onChange={(e) => {
                    const newMethods = [...settings.shipping.methods];
                    newMethods[index].name = e.target.value;
                    handleChange('shipping', 'methods', newMethods);
                  }}
                  className="px-3 py-2 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tên phương thức"
                />
                <input
                  type="number"
                  value={method.price}
                  onChange={(e) => {
                    const newMethods = [...settings.shipping.methods];
                    newMethods[index].price = parseInt(e.target.value);
                    handleChange('shipping', 'methods', newMethods);
                  }}
                  className="px-3 py-2 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phí (₫)"
                />
                <input
                  type="text"
                  value={method.days}
                  onChange={(e) => {
                    const newMethods = [...settings.shipping.methods];
                    newMethods[index].days = e.target.value;
                    handleChange('shipping', 'methods', newMethods);
                  }}
                  className="px-3 py-2 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thời gian (ngày)"
                />
                {method.min_order !== undefined && (
                  <input
                    type="number"
                    value={method.min_order}
                    onChange={(e) => {
                      const newMethods = [...settings.shipping.methods];
                      newMethods[index].min_order = parseInt(e.target.value);
                      handleChange('shipping', 'methods', newMethods);
                    }}
                    className="px-3 py-2 bg-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Đơn tối thiểu (₫)"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.shipping.international_shipping}
            onChange={(e) => handleChange('shipping', 'international_shipping', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm">Vận chuyển quốc tế</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
          <SettingsIcon className="text-blue-600" />
          CÀI ĐẶT HỆ THỐNG
        </h1>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl">
              <CheckCircle size={18} />
              <span className="font-medium">Đã lưu</span>
            </div>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'appearance' && renderAppearance()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'payment' && renderPayment()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'seo' && renderSEO()}
            {activeTab === 'email' && renderEmail()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'shipping' && renderShipping()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;