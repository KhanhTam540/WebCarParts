import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Info, 
  Shield, 
  Truck, 
  RefreshCw, 
  Award, 
  Users, 
  Star, 
  Clock,
  CheckCircle,
  Package,
  Settings,
  Wrench
} from 'lucide-react';

const About = () => {
  const stats = [
    { value: '10,000+', label: 'Sản phẩm', icon: Package },
    { value: '5,000+', label: 'Khách hàng', icon: Users },
    { value: '8+', label: 'Năm kinh nghiệm', icon: Clock },
    { value: '100%', label: 'Chính hãng', icon: Shield },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Chất lượng đảm bảo',
      description: 'Cam kết 100% phụ tùng chính hãng, có nguồn gốc rõ ràng, được kiểm định nghiêm ngặt trước khi đến tay khách hàng.'
    },
    {
      icon: Truck,
      title: 'Giao hàng toàn quốc',
      description: 'Hệ thống vận chuyển rộng khắp 63 tỉnh thành, đảm bảo giao hàng nhanh chóng và an toàn.'
    },
    {
      icon: RefreshCw,
      title: 'Đổi trả dễ dàng',
      description: 'Chính sách đổi trả linh hoạt trong 30 ngày, thủ tục đơn giản, nhanh chóng.'
    },
    {
      icon: Award,
      title: 'Bảo hành dài hạn',
      description: 'Bảo hành lên đến 24 tháng cho tất cả sản phẩm, hỗ trợ kỹ thuật trọn đời.'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn An',
      position: 'Giám đốc điều hành',
      experience: '15 năm kinh nghiệm',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Trần Thị Bình',
      position: 'Giám đốc kỹ thuật',
      experience: '12 năm kinh nghiệm',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
    },
    {
      name: 'Lê Văn Cường',
      position: 'Trưởng phòng kinh doanh',
      experience: '10 năm kinh nghiệm',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20 mb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Info size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black">VỀ CHÚNG TÔI</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            AutoParts - Hệ thống phân phối phụ tùng ô tô chính hãng hàng đầu Việt Nam, 
            cam kết mang đến sản phẩm chất lượng và dịch vụ tốt nhất cho khách hàng.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-20">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-3xl shadow-lg text-center hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={32} className="text-blue-600" />
                </div>
                <p className="text-3xl font-black text-slate-900 mb-2">{stat.value}</p>
                <p className="text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Được thành lập vào năm 2018, AutoParts bắt đầu với sứ mệnh mang đến giải pháp 
                phụ tùng ô tô chất lượng cao với giá cả hợp lý cho thị trường Việt Nam.
              </p>
              <p>
                Qua 8 năm phát triển, chúng tôi tự hào là đối tác tin cậy của hàng ngàn khách hàng 
                cá nhân và doanh nghiệp trên toàn quốc. Với hệ thống kho hàng hiện đại và đội ngũ 
                kỹ thuật giàu kinh nghiệm, chúng tôi cam kết đáp ứng mọi nhu cầu về phụ tùng ô tô.
              </p>
              <p>
                Không chỉ dừng lại ở việc cung cấp sản phẩm, AutoParts còn là người bạn đồng hành 
                đáng tin cậy, luôn lắng nghe và thấu hiểu để mang đến những trải nghiệm tốt nhất 
                cho khách hàng.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-sm font-medium">Chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-sm font-medium">Bảo hành 24 tháng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-sm font-medium">Giao hàng miễn phí</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-sm font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1487754180451-4568a7191e9d?auto=format&fit=crop&q=80&w=800"
              alt="AutoParts Workshop"
              className="rounded-[40px] shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Settings className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">8+</p>
                  <p className="text-sm text-slate-500">Năm kinh nghiệm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white p-12 rounded-[40px] shadow-xl">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-12">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={40} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-500">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-4">Đội ngũ của chúng tôi</h2>
          <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
            Đội ngũ chuyên gia giàu kinh nghiệm, luôn sẵn sàng tư vấn và hỗ trợ khách hàng
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl shadow-lg text-center hover:shadow-xl transition-all">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                <p className="text-sm text-slate-400">{member.experience}</p>
                <div className="flex items-center justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-12 rounded-[40px] text-center">
          <h2 className="text-3xl font-black mb-4">Bắt đầu hành trình cùng AutoParts</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Khám phá ngàn sản phẩm chất lượng, trải nghiệm dịch vụ đẳng cấp
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/search"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              KHÁM PHÁ NGAY
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-colors"
            >
              LIÊN HỆ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;