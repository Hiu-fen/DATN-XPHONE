
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-1000">
          <Title
            level={1}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-6"
          >
            Về XPhone
          </Title>
          <Paragraph className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            XPhone là hệ thống bán lẻ các sản phẩm công nghệ chính hãng hàng đầu Việt Nam. Với hơn 8 năm kinh nghiệm,
            chúng tôi tự hào là đối tác tin cậy của hàng triệu khách hàng trên toàn quốc.
          </Paragraph>
        </div>

        {/* Statistics */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <Row gutter={[24, 24]}>
            {achievements.map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  className="text-center h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl"
                  styles={{ body: { padding: "2rem" } }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>
                  <Statistic
                    value={item.value}
                    valueStyle={{ color: item.color, fontSize: "2rem", fontWeight: "bold" }}
                  />
                  <Text className="text-gray-600 font-medium">{item.title}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Main Content */}
        <Row gutter={[32, 32]} className="mb-16">
          {/* Company Story */}
          <Col xs={24} lg={12}>
            <Card
              className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl animate-in fade-in slide-in-from-left duration-700 delay-300"
              styles={{ body: { padding: "2rem" } }}
            >
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🏢</span>
                  </div>
                  <Title level={2} className="mb-0 text-gray-800">
                    Câu chuyện của chúng tôi
                  </Title>
                </div>
              </div>

              <Paragraph className="text-gray-700 text-base leading-relaxed mb-6">
                Được thành lập vào năm 2016 với tầm nhìn trở thành nhà bán lẻ công nghệ hàng đầu, XPhone đã không ngừng
                phát triển và khẳng định vị thế trên thị trường. Từ một cửa hàng nhỏ, chúng tôi đã mở rộng thành chuỗi
                hệ thống với 25+ cửa hàng trên toàn quốc.
              </Paragraph>

              <Paragraph className="text-gray-700 text-base leading-relaxed mb-6">
                Sứ mệnh của XPhone là democratize công nghệ - làm cho những sản phẩm công nghệ cao cấp trở nên dễ tiếp
                cận hơn với mọi người thông qua dịch vụ chuyên nghiệp và giá cả cạnh tranh.
              </Paragraph>

              <div className="flex flex-wrap gap-2">
                <Tag color="red" className="px-3 py-1 rounded-full">
                  Uy tín
                </Tag>
                <Tag color="blue" className="px-3 py-1 rounded-full">
                  Chất lượng
                </Tag>
                <Tag color="green" className="px-3 py-1 rounded-full">
                  Chuyên nghiệp
                </Tag>
                <Tag color="orange" className="px-3 py-1 rounded-full">
                  Tận tâm
                </Tag>
              </div>
            </Card>
          </Col>

          {/* Timeline */}
          <Col xs={24} lg={12}>
            <Card
              className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl animate-in fade-in slide-in-from-right duration-700 delay-400"
              styles={{ body: { padding: "2rem" } }}
            >
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <ClockCircleOutlined className="text-white text-sm" />
                  </div>
                  <Title level={2} className="mb-0 text-gray-800">
                    Hành trình phát triển
                  </Title>
                </div>
              </div>

              <Timeline items={timeline} className="mt-4" />
            </Card>
          </Col>
        </Row>

        /* Features */
        <div className="mb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tại sao chọn XPhone?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card
                  className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl group"
                  styles={{ body: { padding: "2rem" } }}
                >
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      {React.cloneElement(feature.icon, { className: "text-2xl text-white" })}
                    </div>
                    <Title level={4} className="mb-3 text-gray-800">
                      {feature.title}
                    </Title>
                    <Paragraph className="text-gray-600 text-sm leading-relaxed">{feature.description}</Paragraph>
                  </div>
                </Card>
              </Col>
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

          <Row gutter={[24, 24]} justify="center">
            {teamMembers.map((member, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  className="text-center h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                  styles={{ body: { padding: "2rem" } }}
                >
                  <Avatar size={80} src={member.avatar} className="mb-4 ring-4 ring-white shadow-lg" />
                  <Title level={4} className="mb-1 text-gray-800">
                    {member.name}
                  </Title>
                  <Text className="text-blue-600 font-medium block mb-3">{member.position}</Text>
                  <Paragraph className="text-gray-600 text-sm">{member.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Contact Information */}
        <Card
          className="bg-gradient-to-r from-red-500 to-orange-500 border-0 shadow-2xl rounded-3xl animate-in fade-in slide-in-from-bottom duration-700 delay-700"
          styles={{ body: { padding: "3rem" } }}
        >
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div className="text-white">
                <Title level={2} className="text-white mb-6">
                  Liên hệ với chúng tôi
                </Title>
                <Paragraph className="text-white/90 text-lg leading-relaxed mb-8">
                  Hãy để XPhone đồng hành cùng bạn trong hành trình khám phá công nghệ. Chúng tôi luôn sẵn sàng tư vấn
                  và hỗ trợ bạn 24/7.
                </Paragraph>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <EnvironmentOutlined className="text-white text-lg" />
                    </div>
                    <div>
                      <Text className="text-white font-medium block">Địa chỉ</Text>
                      <Text className="text-white/80">Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</Text>
                    </div>
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