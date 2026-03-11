import axiosClient from './axiosClient';

const cartApi = {
  // Lấy giỏ hàng
  getCart: () => axiosClient.get('/cart/items'),
  
  // Thêm vào giỏ
  addToCart: (data) => axiosClient.post('/cart/items', data),
  
  // Cập nhật số lượng
  updateCartItem: (id, data) => axiosClient.put(`/cart/items/${id}`, data),
  
  // Xóa khỏi giỏ
  removeFromCart: (id) => axiosClient.delete(`/cart/items/${id}`),
};

export default cartApi;