import axiosClient from './axiosClient';

const wishlistApi = {
  // Lấy danh sách yêu thích
  getWishlist: () => axiosClient.get('/wishlist'),
  
  // Thêm vào yêu thích
  addToWishlist: (partId) => axiosClient.post('/wishlist', { part_id: partId }),
  
  // Xóa khỏi yêu thích
  removeFromWishlist: (id) => axiosClient.delete(`/wishlist/${id}`),
  
  // Xóa tất cả yêu thích
  clearWishlist: () => axiosClient.delete('/wishlist'),
  
  // Kiểm tra sản phẩm đã yêu thích chưa
  checkWishlist: (partId) => axiosClient.get(`/wishlist/check/${partId}`),
};

export default wishlistApi;