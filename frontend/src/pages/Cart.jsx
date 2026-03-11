import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cartApi from '../api/cartApi';
import { formatCurrency } from '../utils/formatters';
import { Trash2, ShoppingBag, CreditCard, Plus, Minus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await cartApi.getCart();
      setCart(res.data.data);
    } catch (error) {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return;
    
    setUpdating(true);
    try {
      await cartApi.updateCartItem(itemId, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    setUpdating(true);
    try {
      await cartApi.removeFromCart(itemId);
      await fetchCart();
      toast.success('Đã xóa sản phẩm');
    } catch (error) {
      toast.error('Xóa sản phẩm thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-3">
          <ShoppingBag className="text-blue-600" />
          GIỎ HÀNG CỦA BẠN
        </h1>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center">
            <div className="text-slate-300 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
              TIẾP TỤC MUA SẮM
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm border border-gray-100"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=500'}
                    className="w-24 h-24 rounded-2xl object-cover bg-slate-100"
                    alt={item.name}
                  />
                  
                  <div className="flex-1">
                    <Link to={`/product/${item.part_id}`}>
                      <h3 className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-blue-600 font-black mt-1">{formatCurrency(item.price)}</p>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-sm text-slate-400">Số lượng:</span>
                      <div className="flex items-center border rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock_quantity)}
                          disabled={updating || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock_quantity)}
                          disabled={updating || item.quantity >= item.stock_quantity}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-sm text-slate-400">
                        Còn {item.stock_quantity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-orange-600">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating}
                      className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] shadow-xl h-fit border border-gray-100 sticky top-28">
                <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-medium">{formatCurrency(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-6"></div>

                <div className="flex justify-between mb-8 text-xl">
                  <span className="font-black">Tổng cộng</span>
                  <span className="font-black text-orange-600">{formatCurrency(cart.total)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={updating || cart.items.length === 0}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard size={20} />
                  THANH TOÁN NGAY
                </button>

                <Link
                  to="/"
                  className="w-full text-center mt-4 text-sm text-slate-500 hover:text-blue-600 transition-colors block"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;