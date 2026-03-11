import axiosClient from './axiosClient';

const adminApi = {
  // ========== DASHBOARD ==========
  getDashboardStats: (params) => axiosClient.get('/admin/dashboard/stats', { params }),
  
  // ========== THỐNG KÊ CHI TIẾT ==========
  getDetailedStatistics: (params) => axiosClient.get('/admin/statistics/detailed', { params }),
  getRevenueStats: (params) => axiosClient.get('/admin/stats/revenue', { params }),
  
  // ========== QUẢN LÝ USERS ==========
  getUsers: () => axiosClient.get('/admin/users'),
  createUser: (data) => axiosClient.post('/admin/users', data),
  updateUser: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
  toggleUserStatus: (id, data) => axiosClient.put(`/admin/users/${id}/status`, data),
  
  // ========== QUẢN LÝ BRANDS ==========
  createBrand: (data) => axiosClient.post('/admin/brands', data),
  updateBrand: (id, data) => axiosClient.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => axiosClient.delete(`/admin/brands/${id}`),
  
  // ========== QUẢN LÝ MODELS ==========
  createModel: (data) => axiosClient.post('/admin/models', data),
  updateModel: (id, data) => axiosClient.put(`/admin/models/${id}`, data),
  deleteModel: (id) => axiosClient.delete(`/admin/models/${id}`),
  
  // ========== QUẢN LÝ MODEL YEARS ==========
  createModelYear: (data) => axiosClient.post('/admin/model-years', data),
  deleteModelYear: (id) => axiosClient.delete(`/admin/model-years/${id}`),
  
  // ========== QUẢN LÝ CATEGORIES ==========
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
  
  // ========== QUẢN LÝ PARTS ==========
  createPart: (data) => axiosClient.post('/admin/parts', data),
  updatePart: (id, data) => axiosClient.put(`/admin/parts/${id}`, data),
  deletePart: (id) => axiosClient.delete(`/admin/parts/${id}`),
  addCompatibility: (id, data) => axiosClient.post(`/admin/parts/${id}/compatibility`, data),
  
  // ========== QUẢN LÝ ORDERS ==========
  getOrders: () => axiosClient.get('/admin/orders'),
  updateOrderStatus: (id, data) => axiosClient.put(`/admin/orders/${id}/status`, data),

  // ========== SETTINGS ==========
  getSettings: () => axiosClient.get('/admin/settings'),
  updateSettings: (data) => axiosClient.put('/admin/settings', data),
};

export default adminApi;