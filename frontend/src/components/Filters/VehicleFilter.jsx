import React, { useState, useEffect } from 'react';
import { Car, Filter, Search } from 'lucide-react';
import productApi from '../../api/productApi';

const VehicleFilter = ({ onSearch }) => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
      setSelectedModel('');
      setSelectedYear('');
      setYears([]);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel) {
      fetchYears(selectedModel);
      setSelectedYear('');
    }
  }, [selectedModel]);

  const fetchBrands = async () => {
    try {
      const res = await productApi.getBrands();
      setBrands(res.data.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchModels = async (brandId) => {
    setLoading(true);
    try {
      const res = await productApi.getModels(brandId);
      setModels(res.data.data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async (modelId) => {
    setLoading(true);
    try {
      const res = await productApi.getYears(modelId);
      setYears(res.data.data);
    } catch (error) {
      console.error('Failed to fetch years:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (selectedYear) {
      onSearch({ model_year_id: selectedYear });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-2 rounded-[32px] border border-white/10 shadow-2xl">
      <div className="bg-white rounded-[24px] p-4 flex flex-wrap lg:flex-nowrap gap-4 items-center">
        {/* Brand */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl">
            <Car className="text-blue-600 shrink-0" size={20} />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent w-full outline-none text-slate-700 font-medium"
            >
              <option value="">Chọn hãng xe</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl">
            <Filter className="text-blue-600 shrink-0" size={20} />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand || loading}
              className="bg-transparent w-full outline-none text-slate-700 font-medium disabled:opacity-50"
            >
              <option value="">Chọn dòng xe</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl">
            <Filter className="text-blue-600 shrink-0" size={20} />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedModel || loading}
              className="bg-transparent w-full outline-none text-slate-700 font-medium disabled:opacity-50"
            >
              <option value="">Chọn năm sản xuất</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={!selectedYear}
          className="w-full lg:w-auto bg-blue-600 hover:bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={20} />
          TÌM PHỤ TÙNG
        </button>
      </div>
    </div>
  );
};

export default VehicleFilter;