import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { UserPlus, Mail, Lock, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '', // Thêm trường họ tên
    phone: '', // Thêm trường số điện thoại
    address: '' // Thêm trường địa chỉ
  });
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = () => {
    if (formData.password !== formData.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }
    
    // Optional: Bỏ validate password phức tạp nếu không cần
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.username.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }
    
    if (!validateEmail(formData.email)) return;
    
    if (!validatePassword()) return;

    setLoading(true);
    
    try {
      // Gửi đầy đủ thông tin lên backend
      const response = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        address: formData.address || null
      });

      console.log('Register response:', response.data);
      
      // Hiển thị thông báo thành công
      toast.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.', {
        duration: 5000,
        icon: '🎉'
      });
      
      // Đặt trạng thái thành công để hiển thị thông báo
      setRegisterSuccess(true);
      
      // Chuyển hướng về trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Register error:', error);
      
      // Xử lý lỗi từ backend
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Đăng ký không thành công. Vui lòng thử lại.';
      
      toast.error(errorMessage, {
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Nếu đăng ký thành công, hiển thị thông báo
  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            ĐĂNG KÝ THÀNH CÔNG!
          </h2>
          <p className="text-slate-600 mb-6">
            Tài khoản <strong>{formData.username}</strong> đã được tạo thành công.
            <br />
            Bạn có thể đăng nhập ngay bây giờ.
          </p>
          <div className="animate-pulse text-sm text-slate-400">
            Đang chuyển hướng đến trang đăng nhập...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900">
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <p className="text-slate-500 mt-2">
            Nhập thông tin để tạo tài khoản mới
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập *"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Full Name (optional) */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="text"
              name="full_name"
              placeholder="Họ và tên (không bắt buộc)"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone (optional) */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="tel"
              name="phone"
              placeholder="Số điện thoại (không bắt buộc)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address (optional) */}
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ (không bắt buộc)"
              value={formData.address}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu *"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="password"
              name="confirm_password"
              placeholder="Xác nhận mật khẩu *"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={20} />
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>

          {/* Thông báo bảo mật */}
          <p className="text-xs text-slate-400 text-center mt-4">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Chính sách bảo mật
            </Link>{' '}
            của chúng tôi.
          </p>
        </form>

        {/* Login Link */}
        <p className="text-center mt-8 text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;