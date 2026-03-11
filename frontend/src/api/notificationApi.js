import axiosClient from './axiosClient';

const notificationApi = {
  // Lấy tất cả thông báo
  getNotifications: () => axiosClient.get('/notifications'),
  
  // Lấy chi tiết 1 thông báo
  getNotificationById: (id) => axiosClient.get(`/notifications/${id}`),
  
  // Lấy thông báo chưa đọc
  getUnreadNotifications: () => axiosClient.get('/notifications/unread'),
  
  // Đánh dấu đã đọc 1 thông báo
  markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  
  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => axiosClient.put('/notifications/read-all'),
  
  // Xóa 1 thông báo
  deleteNotification: (id) => axiosClient.delete(`/notifications/${id}`),
  
  // Xóa tất cả thông báo
  deleteAllNotifications: () => axiosClient.delete('/notifications'),
  
  // Đếm số thông báo chưa đọc
  getUnreadCount: () => axiosClient.get('/notifications/unread/count'),
};

export default notificationApi;