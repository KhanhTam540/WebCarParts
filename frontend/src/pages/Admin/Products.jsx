import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import productApi from '../../api/productApi';
import { formatCurrency } from '../../utils/formatters';
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Image,
  X,
  Check,
  Loader,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel) {
      fetchYears(selectedModel);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, categoryFilter, searchTerm]);

  const fetchData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        productApi.getCategories(),
        productApi.getBrands(),
      ]);
      setCategories(categoriesRes.data.data || []);
      setBrands(brandsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        keyword: searchTerm || undefined,
        category_id: categoryFilter || undefined
      };
      const res = await productApi.search(params);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async (brandId) => {
    try {
      const res = await productApi.getModels(brandId);
      setModels(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const fetchYears = async (modelId) => {
    try {
      const res = await productApi.getYears(modelId);
      setYears(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleYearToggle = (yearId) => {
    setSelectedYears(prev =>
      prev.includes(yearId)
        ? prev.filter(id => id !== yearId)
        : [...prev, yearId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.name || !formData.price || !formData.stock_quantity) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      let productId;
      
      if (editingProduct) {
        // Update product
        await adminApi.updatePart(editingProduct.id, {
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity)
        });
        toast.success('Cập nhật sản phẩm thành công');
        productId = editingProduct.id;
      } else {
        // Create product
        const res = await adminApi.createPart({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity)
        });
        toast.success('Thêm sản phẩm thành công');
        productId = res.data.data.id;
      }
      
      // Add compatibility if years selected
      if (selectedYears.length > 0 && !editingProduct) {
        await adminApi.addCompatibility(productId, {
          model_year_ids: selectedYears
        });
        toast.success('Đã thêm khả năng tương thích');
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await adminApi.deletePart(id);
      toast.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  const handleViewDetail = async (product) => {
    try {
      const res = await productApi.getById(product.id);
      setViewingProduct(res.data.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Không thể tải chi tiết sản phẩm');
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      image_url: '',
    });
    setEditingProduct(null);
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYears([]);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider flex items-center gap-3">
          <Package className="text-blue-600" />
          QUẢN LÝ SẢN PHẨM
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Nút THÊM SẢN PHẨM */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
          >
            <Plus size={20} />
            THÊM SẢN PHẨM
          </button>

          {/* Nút Lọc */}
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Filter size={18} />
            LỌC
          </button>

          {/* Nút Xuất Excel */}
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
                <th className="px-6 py-4 font-medium">Sản phẩm</th>
                <th className="px-6 py-4 font-medium">Danh mục</th>
                <th className="px-6 py-4 font-medium">Giá</th>
                <th className="px-6 py-4 font-medium">Tồn kho</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=50'}
                        className="w-12 h-12 rounded-xl object-cover"
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=50';
                        }}
                      />
                      <div>
                        <p className="font-bold text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                      {product.category_name}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 font-black text-orange-600">
                    {formatCurrency(product.price)}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`font-bold ${
                      product.stock_quantity > 10
                        ? 'text-green-600'
                        : product.stock_quantity > 0
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      product.stock_quantity > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity > 0 ? (
                        <Check size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}
                      {product.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(product)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            category_id: product.category_id,
                            name: product.name,
                            description: product.description || '',
                            price: product.price,
                            stock_quantity: product.stock_quantity,
                            image_url: product.image_url || '',
                          });
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-xl transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} />
            </button>
            
            {pagination.totalPages > 0 && [...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Chỉ hiển thị tối đa 5 trang
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`w-10 h-10 rounded-xl ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-100'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === pagination.page - 3 ||
                pageNum === pagination.page + 3
              ) {
                return <span key={pageNum} className="text-slate-400">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Modal - Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="1000"
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số lượng tồn kho <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stock_quantity"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        URL hình ảnh
                      </label>
                      <input
                        type="url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                    </div>

                    {formData.image_url && (
                      <div>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-32 h-32 rounded-xl object-cover border"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Compatibility section */}
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-bold mb-4">Khả năng tương thích</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn hãng xe</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={!selectedBrand}
                      className="px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Chọn dòng xe</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>

                    <select
                      disabled
                      className="px-4 py-3 bg-slate-50 rounded-xl outline-none opacity-50 cursor-not-allowed"
                    >
                      <option>Chọn năm (click bên dưới)</option>
                    </select>
                  </div>

                  {/* Year checkboxes */}
                  {years.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="font-medium mb-3">Chọn năm sản xuất:</p>
                      <div className="flex flex-wrap gap-2">
                        {years.map((year) => (
                          <button
                            key={year.id}
                            type="button"
                            onClick={() => handleYearToggle(year.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                              selectedYears.includes(year.id)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white hover:bg-slate-100'
                            }`}
                          >
                            {year.year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form buttons */}
                <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <Loader size={16} className="animate-spin" />}
                    {editingProduct ? 'CẬP NHẬT' : 'THÊM SẢN PHẨM'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showDetailModal && viewingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chi tiết sản phẩm</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div>
                  <img
                    src={viewingProduct.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500'}
                    className="w-full h-64 rounded-2xl object-cover"
                    alt={viewingProduct.name}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                      {viewingProduct.category_name}
                    </span>
                    <h3 className="text-2xl font-bold mt-2">{viewingProduct.name}</h3>
                  </div>

                  <p className="text-slate-600">{viewingProduct.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Giá bán</p>
                      <p className="text-xl font-black text-orange-600">{formatCurrency(viewingProduct.price)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Tồn kho</p>
                      <p className={`text-xl font-black ${
                        viewingProduct.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {viewingProduct.stock_quantity}
                      </p>
                    </div>
                  </div>

                  {/* Compatible vehicles */}
                  {viewingProduct.compatible_vehicles?.length > 0 && (
                    <div>
                      <p className="font-bold mb-2">Xe tương thích:</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingProduct.compatible_vehicles.map((v, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-100 rounded-xl text-sm"
                          >
                            {v.brand_name} {v.model_name} ({v.year})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-8 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;