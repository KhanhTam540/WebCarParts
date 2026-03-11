import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import wishlistApi from '../api/wishlistApi';
import cartApi from '../api/cartApi';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ChevronLeft,
  Loader,
  Package,
  Star
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.getWishlist();
      setWishlist(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await wishlistApi.removeFromWishlist(id);
      setWishlist(prev => prev.filter(item => item.id !== id));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Xóa sản phẩm thất bại');
    }
  };

  const handleAddToCart = async (partId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    try {
      await cartApi.addToCart({ part_id: partId, quantity: 1 });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error(error.response?.data?.message || 'Thêm vào giỏ thất bại');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?')) return;
    
    try {
      await wishlistApi.clearWishlist();
      setWishlist([]);
      toast.success('Đã xóa tất cả sản phẩm yêu thích');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      toast.error('Xóa tất cả thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Heart className="text-red-500" size={32} />
              SẢN PHẨM YÊU THÍCH
            </h1>
            <p className="text-slate-500 mt-2">
              {wishlist.length} {wishlist.length === 1 ? 'sản phẩm' : 'sản phẩm'} trong danh sách yêu thích
            </p>
          </div>
          <div className="flex items-center gap-3">
            {wishlist.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Xóa tất cả
              </button>
            )}
            <Link
              to="/search"
              className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Wishlist Grid */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center">
            <div className="relative">
              <Heart size={80} className="mx-auto text-slate-200 mb-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">❤️</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              Danh sách yêu thích trống
            </h2>
            <p className="text-slate-500 mb-8">
              Hãy thêm sản phẩm vào danh sách yêu thích để theo dõi
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              KHÁM PHÁ SẢN PHẨM
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
              >
                <Link to={`/product/${item.part_id}`} className="block">
                  <div className="relative h-56 bg-slate-100">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => handleRemoveFromWishlist(item.id, e)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Heart size={20} className="text-red-500 fill-current" />
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {item.category_name}
                      </span>
                    </div>
                    {item.stock_quantity <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">HẾT HÀNG</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <Link to={`/product/${item.part_id}`}>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 h-14 hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">(0)</span>
                  </div>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">
                    {item.description}
                  </p>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-black text-orange-600">
                        {formatCurrency(item.price)}
                      </span>
                      <p className="text-[10px] text-green-600 font-bold uppercase mt-1">
                        Còn {item.stock_quantity} sản phẩm
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleAddToCart(item.part_id, e)}
                        disabled={item.stock_quantity <= 0 || addingToCart}
                        className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingCart size={20} />
                      </button>
                      <Link
                        to={`/product/${item.part_id}`}
                        className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
                        title="Xem chi tiết"
                      >
                        <Package size={20} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4 text-xs text-slate-400 border-t pt-3">
                  Thêm vào ngày: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist Summary */}
        {wishlist.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <Heart size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tổng số sản phẩm yêu thích</p>
                  <p className="text-2xl font-bold text-slate-900">{wishlist.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tổng giá trị</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(wishlist.reduce((sum, item) => sum + item.price, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;