import axiosClient from './axiosClient';

const authApi = {
  // Đăng ký tài khoản
  register: (data) => axiosClient.post('/auth/register', data),
  
  // Xác thực OTP
  //verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
  
  // Đăng nhập
  login: (data) => axiosClient.post('/auth/login', data),
  
  // Lấy profile
  getProfile: () => axiosClient.get('/user/profile'),
  
  // Cập nhật profile
  updateProfile: (data) => axiosClient.put('/user/profile', data),
  
  // Đổi mật khẩu
  changePassword: (data) => axiosClient.put('/user/change-password', data),
};

export default authApi;