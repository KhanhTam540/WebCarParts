import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Điện thoại',
      content: '1900 1234',
      detail: 'Thứ 2 - CN, 8:00 - 22:00',
      color: 'blue'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'support@autoparts.vn',
      detail: 'Phản hồi trong 24h',
      color: 'green'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ',
      content: '123 Nguyễn Văn Linh, Quận 7',
      detail: 'TP. Hồ Chí Minh',
      color: 'purple'
    },
    {
      icon: Clock,
      title: 'Giờ làm việc',
      content: '8:00 - 22:00',
      detail: 'Tất cả các ngày trong tuần',
      color: 'orange'
    }
  ];

  const faqs = [
    {
      question: 'Thời gian giao hàng mất bao lâu?',
      answer: 'Thời gian giao hàng từ 3-5 ngày làm việc đối với nội thành và 5-7 ngày đối với ngoại thành.'
    },
    {
      question: 'Chính sách đổi trả như thế nào?',
      answer: 'Quý khách có thể đổi trả trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem mác và chưa qua sử dụng.'
    },
    {
      question: 'Làm sao để tra cứu đơn hàng?',
      answer: 'Quý khách có thể tra cứu đơn hàng trong mục "Đơn hàng của tôi" sau khi đăng nhập hoặc liên hệ hotline 1900 1234.'
    },
    {
      question: 'Có được kiểm tra hàng trước khi thanh toán không?',
      answer: 'Có, quý khách được kiểm tra hàng trước khi thanh toán đối với hình thức giao hàng COD.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20 mb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black">LIÊN HỆ</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, 
            đội ngũ AutoParts sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-16">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            const colors = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600',
              orange: 'bg-orange-50 text-orange-600'
            };
            return (
              <div key={index} className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                <div className={`w-14 h-14 ${colors[info.color]} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-lg mb-2">{info.title}</h3>
                <p className="text-xl font-bold text-slate-900 mb-1">{info.content}</p>
                <p className="text-sm text-slate-400">{info.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Map and Contact Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="bg-white p-6 rounded-[32px] shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-blue-600" />
              Vị trí của chúng tôi
            </h2>
            <div className="rounded-2xl overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6693614700587!2d106.69533611480078!3d10.759849992332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbf1c4c4c4d%3A0x3b7f1c7b1c7b1c7b!2zMTIzIMSQLiBOZ3V54buFbiBWxINuIExpbmgsIFF14bqtbiA3LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="AutoParts Location"
                className="w-full h-full"
              />
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h3 className="font-bold mb-4">Kết nối với chúng tôi</h3>
              <div className="flex items-center gap-3">
                <a href="#" className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-sky-50 text-sky-400 rounded-xl flex items-center justify-center hover:bg-sky-400 hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Gửi thành công!</h3>
                <p className="text-green-600">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="090 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tiêu đề tin nhắn"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung tin nhắn..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      ĐANG GỬI...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      GỬI TIN NHẮN
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white p-12 rounded-[40px] shadow-xl">
          <h2 className="text-3xl font-black text-center mb-4">Câu hỏi thường gặp</h2>
          <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
            Những câu hỏi thường gặp về sản phẩm và dịch vụ của AutoParts
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-2xl hover:shadow-md transition-all">
                <h3 className="font-bold text-lg mb-3 flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-slate-500 text-sm pl-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-12 rounded-[40px] text-center">
          <h2 className="text-3xl font-black mb-4">Cần hỗ trợ khẩn cấp?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Đội ngũ tư vấn viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="tel:19001234"
              className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              <Phone size={20} />
              GỌI NGAY 1900 1234
            </a>
            <a
              href="mailto:support@autoparts.vn"
              className="flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-colors"
            >
              <Mail size={20} />
              GỬI EMAIL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;