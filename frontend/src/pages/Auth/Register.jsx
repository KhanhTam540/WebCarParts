import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import { UserPlus, Mail, Lock, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
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
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setStep(2);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyOtp({
        email: formData.email,
        otp_code: otp,
      });
      toast.success('Xác thực thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error('Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Gọi API resend OTP
      toast.success('Mã OTP đã được gửi lại');
    } catch (error) {
      toast.error('Gửi lại OTP thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900">
            {step === 1 ? 'TẠO TÀI KHOẢN' : 'XÁC THỰC EMAIL'}
          </h2>
          {step === 2 && (
            <p className="text-slate-500 mt-2">
              Chúng tôi đã gửi mã OTP gồm 6 chữ số đến {formData.email}
            </p>
          )}
        </div>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="text"
                name="username"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={3}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email của bạn"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="password"
                name="confirm_password"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all disabled:opacity-50"
            >
              <UserPlus size={20} />
              {loading ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Nhập mã OTP 6 số"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-[10px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {loading ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC TÀI KHOẢN'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-blue-600 hover:underline"
              >
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="text-center mt-8 text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;