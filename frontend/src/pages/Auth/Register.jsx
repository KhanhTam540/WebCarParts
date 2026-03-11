import axiosClient from './axiosClient';

const authApi = {
  // Đăng ký - không cần OTP
  register: (data) => {
    return axiosClient.post('/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
      address: data.address
    });
  },

  // Đăng nhập
  login: (data) => {
    return axiosClient.post('/auth/login', {
      username: data.username,
      password: data.password
    });
  },

  // Xóa hoặc comment các hàm OTP
  // verifyOtp: (data) => {
  //   return axiosClient.post('/auth/verify-otp', data);
  // },
  
  // resendOtp: (data) => {
  //   return axiosClient.post('/auth/resend-otp', data);
  // },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    return axiosClient.get('/auth/me');
  }
};

export default authApi;