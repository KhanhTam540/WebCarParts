import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Common/ProductCard';
import productApi from '../api/productApi';
import { Search, Filter, X } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    model_year_id: searchParams.get('model_year_id') || '',
    category_id: '',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchParts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      setCategories(res.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchParts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await productApi.search(params);
      setParts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      model_year_id: '',
      category_id: '',
      page: 1,
      limit: 12,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = filters.keyword || filters.model_year_id || filters.category_id;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">KẾT QUẢ TÌM KIẾM</h1>
          <p className="text-slate-500">
            {pagination.total > 0 
              ? `Tìm thấy ${pagination.total} sản phẩm phù hợp`
              : 'Không tìm thấy sản phẩm nào'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10">
          <div className="flex items-center gap-4 mb-4">
            <Filter size={20} className="text-blue-600" />
            <h2 className="font-bold text-slate-800">Bộ lọc</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 flex items-center gap-1 hover:text-red-600"
              >
                <X size={16} /> Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort (có thể thêm sau) */}
            <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sắp xếp: Mặc định</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
              <option value="name_asc">Tên: A-Z</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : parts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {parts.map((part) => (
                <ProductCard key={part.id} part={part} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current"
                >
                  ←
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl border ${
                      pagination.page === i + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-slate-100'
                    } transition-colors`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current"
                >
                  →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-slate-300 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-slate-500">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;