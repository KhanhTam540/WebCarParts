import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-2xl font-black mb-6">
              <Package className="w-8 h-8 text-blue-500" />
              CARPARTS<span className="text-blue-500">.</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Hệ thống tra cứu và mua phụ tùng ô tô thông minh theo từng đời xe. Cam kết chính hãng 100%.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-400 hover:text-white transition-colors">
                  Tra cứu phụ tùng
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-400 hover:text-white transition-colors">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-slate-400 hover:text-white transition-colors">
                  Đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-white transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-slate-400 hover:text-white transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-slate-400 hover:text-white transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin size={20} className="shrink-0 mt-1" />
                <span>Địa chỉ: Tòa BS15 -The Oasis - Vinhomes Grand Park, Phước Thiện, Long Bình, Thành phố Thủ Đức - Thành phố Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone size={20} />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail size={20} />
                <span>support@carparts.vn</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
          <p>&copy; 2024 CarParts.vn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;