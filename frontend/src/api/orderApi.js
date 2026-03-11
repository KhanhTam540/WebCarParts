import axiosClient from './axiosClient';

const orderApi = {
  // Tạo đơn hàng
  createOrder: () => axiosClient.post('/orders'),
  
  // Lấy danh sách đơn hàng
  getOrders: () => axiosClient.get('/orders'),
  
  // Chi tiết đơn hàng
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
};

export default orderApi;