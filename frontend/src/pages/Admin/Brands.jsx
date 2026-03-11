import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import productApi from '../../api/productApi';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Loader,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await productApi.getBrands();
      setBrands(res.data.data);
    } catch (error) {
      toast.error('Không thể tải danh sách hãng xe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Vui lòng nhập tên hãng xe');
      return;
    }

    setLoading(true);
    try {
      if (editingBrand) {
        await adminApi.updateBrand(editingBrand.id, formData);
        toast.success('Cập nhật hãng xe thành công');
      } else {
        await adminApi.createBrand(formData);
        toast.success('Thêm hãng xe thành công');
      }
      
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa hãng xe này?')) return;
    
    try {
      await adminApi.deleteBrand(id);
      toast.success('Xóa hãng xe thành công');
      fetchBrands();
    } catch (error) {
      toast.error('Xóa hãng xe thất bại');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', country: '' });
    setEditingBrand(null);
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && brands.length === 0) {
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
          <Car className="text-blue-600" />
          QUẢN LÝ HÃNG XE
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm hãng xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nút THÊM HÃNG XE */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
          >
            <Plus size={20} />
            THÊM HÃNG XE
          </button>

          {/* Nút Xuất Excel */}
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Brands grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Car className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{brand.name}</h3>
                  {brand.country && (
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <Globe size={14} />
                      {brand.country}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingBrand(brand);
                    setFormData({
                      name: brand.name,
                      country: brand.country || '',
                    });
                    setShowModal(true);
                  }}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-md w-full">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingBrand ? 'Chỉnh sửa hãng xe' : 'Thêm hãng xe mới'}
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên hãng xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Toyota, Honda, Ford..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quốc gia
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Japan, USA, Germany..."
                    />
                  </div>
                </div>

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
                    {editingBrand ? 'CẬP NHẬT' : 'THÊM'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;