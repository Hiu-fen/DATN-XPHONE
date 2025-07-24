import {
  Smartphone,
  Shield,
  Users,
  Truck,
  Gift,
  Star,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Target,
  Heart,
  Zap,
} from "lucide-react"

const About = () => {
  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Sản phẩm chính hãng 100%",
      description: "Cam kết mọi sản phẩm đều chính hãng từ nhà sản xuất",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Đội ngũ tư vấn chuyên nghiệp",
      description: "Nhân viên được đào tạo bài bản, nhiệt tình hỗ trợ",
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: "Giao hàng nhanh chóng",
      description: "Giao hàng trong 24h tại nội thành",
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Chương trình khuyến mãi hấp dẫn",
      description: "Thường xuyên có các ưu đãi và quà tặng giá trị",
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Bảo hành uy tín",
      description: "Chính sách bảo hành toàn diện, đổi trả dễ dàng",
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Dịch vụ hậu mãi tận tâm",
      description: "Hỗ trợ khách hàng 24/7, xử lý sự cố nhanh chóng",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Giới thiệu về <span className="text-yellow-300">XPhone</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Hệ thống bán lẻ các sản phẩm công nghệ chính hãng như iPhone, Macbook, iPad, Apple Watch và phụ kiện cao
            cấp. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng, giá cả cạnh tranh cùng dịch vụ
            chăm sóc tận tâm.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tại sao chọn XPhone?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Về chúng tôi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sứ mệnh</h3>
              </div>
              <p className="text-gray-600">
                Mang đến những sản phẩm công nghệ tốt nhất với giá cả hợp lý nhất cho mọi người Việt Nam
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tầm nhìn</h3>
              </div>
              <p className="text-gray-600">
                Trở thành hệ thống bán lẻ công nghệ hàng đầu Việt Nam, được khách hàng tin tưởng nhất
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Giá trị cốt lõi</h3>
              </div>
              <p className="text-gray-600">
                Chất lượng - Uy tín - Tận tâm. Luôn đặt lợi ích khách hàng lên hàng đầu trong mọi hoạt động
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h2>
            <p className="text-lg text-gray-600">Hãy liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Địa chỉ cửa hàng</h3>
              <p className="text-gray-600">Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <Phone className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotline hỗ trợ</h3>
              <p className="text-red-600 font-semibold">Hãy alo cho Hiếu</p>
              <p className="text-sm text-gray-500 mt-1">Hỗ trợ 24/7</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email liên hệ</h3>
              <a
                href="mailto:trinhthiduong@gmail.com"
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                trinhthiduong@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
