import axiosClient from './axiosClient';

const productApi = {
  // Tìm kiếm phụ tùng
  search: (params) => axiosClient.get('/parts/search', { params }),
  
  // Chi tiết phụ tùng
  getById: (id) => axiosClient.get(`/parts/${id}`),
  
  // Danh sách hãng xe
  getBrands: () => axiosClient.get('/brands'),
  
  // Danh sách dòng xe theo hãng
  getModels: (brandId) => axiosClient.get(`/brands/${brandId}/models`),
  
  // Danh sách năm theo dòng xe
  getYears: (modelId) => axiosClient.get(`/models/${modelId}/years`),
  
  // Phụ tùng tương thích với năm xe
  getCompatibleParts: (yearId) => axiosClient.get(`/years/${yearId}/compatibility`),
  
  // Danh sách danh mục
  getCategories: () => axiosClient.get('/categories'),
};

export default productApi;