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
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const Models = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [expandedModel, setExpandedModel] = useState(null);
  
  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
  });

  const [yearData, setYearData] = useState({
    model_id: '',
    year: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandsRes] = await Promise.all([
        productApi.getBrands(),
      ]);
      setBrands(brandsRes.data.data);
      
      // Fetch models for each brand
      const modelsPromises = brandsRes.data.data.map(brand =>
        productApi.getModels(brand.id)
      );
      const modelsRes = await Promise.all(modelsPromises);
      const allModels = modelsRes.flatMap(res => res.data.data);
      setModels(allModels);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelsForBrand = async (brandId) => {
    try {
      const res = await productApi.getModels(brandId);
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
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
    
    if (!formData.brand_id || !formData.name) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      if (editingModel) {
        await adminApi.updateModel(editingModel.id, formData);
        toast.success('Cập nhật dòng xe thành công');
      } else {
        await adminApi.createModel(formData);
        toast.success('Thêm dòng xe thành công');
      }
      
      setShowModal(false);
      resetForm();
      
      // Refresh models
      const newModels = await fetchModelsForBrand(formData.brand_id);
      setModels(prev => {
        const otherModels = prev.filter(m => m.brand_id !== parseInt(formData.brand_id));
        return [...otherModels, ...newModels];
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa dòng xe này?')) return;
    
    try {
      await adminApi.deleteModel(id);
      toast.success('Xóa dòng xe thành công');
      setModels(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      toast.error('Xóa dòng xe thất bại');
    }
  };

  const handleAddYear = async (e) => {
    e.preventDefault();
    
    if (!yearData.year) {
      toast.error('Vui lòng nhập năm sản xuất');
      return;
    }

    setLoading(true);
    try {
      await adminApi.createModelYear({
        model_id: yearData.model_id,
        year: parseInt(yearData.year),
      });
      
      toast.success('Thêm năm sản xuất thành công');
      setShowYearModal(false);
      setYearData({ model_id: '', year: '' });
      
      // Refresh years for the model
      const yearsRes = await productApi.getYears(yearData.model_id);
      setModels(prev => prev.map(m => 
        m.id === parseInt(yearData.model_id)
          ? { ...m, years: yearsRes.data.data }
          : m
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm năm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (yearId, modelId) => {
    if (!confirm('Bạn có chắc muốn xóa năm sản xuất này?')) return;
    
    try {
      await adminApi.deleteModelYear(yearId);
      toast.success('Xóa năm sản xuất thành công');
      
      // Refresh years
      const yearsRes = await productApi.getYears(modelId);
      setModels(prev => prev.map(m => 
        m.id === modelId
          ? { ...m, years: yearsRes.data.data }
          : m
      ));
    } catch (error) {
      toast.error('Xóa năm sản xuất thất bại');
    }
  };

  const resetForm = () => {
    setFormData({ brand_id: '', name: '' });
    setEditingModel(null);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'N/A';
  };

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBrandName(m.brand_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByBrand = filteredModels.reduce((acc, model) => {
    const brandName = getBrandName(model.brand_id);
    if (!acc[brandName]) {
      acc[brandName] = [];
    }
    acc[brandName].push(model);
    return acc;
  }, {});

  if (loading && models.length === 0) {
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
          QUẢN LÝ DÒNG XE
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
              placeholder="Tìm kiếm dòng xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nút THÊM DÒNG XE */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
          >
            <Plus size={20} />
            THÊM DÒNG XE
          </button>

          {/* Nút Xuất Excel */}
          <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Models by brand */}
      <div className="space-y-6">
        {Object.entries(groupedByBrand).map(([brandName, brandModels]) => (
          <div key={brandName} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-bold text-lg text-slate-800">{brandName}</h2>
            </div>
            
            <div className="divide-y">
              {brandModels.map((model) => (
                <div key={model.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{model.name}</h3>
                        <button
                          onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {expandedModel === model.id ? (
                            <ChevronUp size={18} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedModel(model);
                          setYearData({ model_id: model.id, year: '' });
                          setShowYearModal(true);
                        }}
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        <Calendar size={14} />
                        Thêm năm
                      </button>
                      <button
                        onClick={() => {
                          setEditingModel(model);
                          setFormData({
                            brand_id: model.brand_id,
                            name: model.name,
                          });
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Years section */}
                  {expandedModel === model.id && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-slate-600 mb-3">Các năm sản xuất:</p>
                      {model.years && model.years.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {model.years.map((year) => (
                            <div
                              key={year.id}
                              className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border"
                            >
                              <span className="font-medium">{year.year}</span>
                              <button
                                onClick={() => handleDeleteYear(year.id, model.id)}
                                className="text-red-500 hover:text-red-600 ml-1"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Chưa có năm sản xuất nào</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Model Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-md w-full">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingModel ? 'Chỉnh sửa dòng xe' : 'Thêm dòng xe mới'}
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
                      Hãng xe <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn hãng xe</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tên dòng xe <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Camry, Civic, Ranger..."
                      required
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
                    {editingModel ? 'CẬP NHẬT' : 'THÊM'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Year Modal */}
      {showYearModal && selectedModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-md w-full">
            <form onSubmit={handleAddYear}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Thêm năm sản xuất cho {selectedModel.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowYearModal(false);
                      setYearData({ model_id: '', year: '' });
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Năm sản xuất <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={yearData.year}
                      onChange={(e) => setYearData({ ...yearData, year: e.target.value })}
                      min="1900"
                      max="2100"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 2024"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowYearModal(false);
                      setYearData({ model_id: '', year: '' });
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
                    THÊM NĂM
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

export default Models;