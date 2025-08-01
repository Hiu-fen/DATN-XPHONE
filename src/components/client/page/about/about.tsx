"use client"

import React from "react"
import { Card, Row, Col, Typography, Timeline, Statistic, Avatar, Tag } from "antd"
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  TruckOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  StarOutlined,
  TeamOutlined,
  ShopOutlined,
  GlobalOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography

const About = () => {
  const achievements = [
    { title: "Khách hàng tin tưởng", value: "50,000+", icon: <TeamOutlined />, color: "#1890ff" },
    { title: "Sản phẩm đã bán", value: "100,000+", icon: <ShopOutlined />, color: "#52c41a" },
    { title: "Năm kinh nghiệm", value: "8+", icon: <StarOutlined />, color: "#faad14" },
    { title: "Cửa hàng toàn quốc", value: "25+", icon: <GlobalOutlined />, color: "#f5222d" },
  ]

  const features = [
    {
      icon: <SafetyOutlined className="text-2xl text-blue-600" />,
      title: "Sản phẩm chính hãng 100%",
      description: "Cam kết tất cả sản phẩm đều chính hãng, có đầy đủ giấy tờ và tem bảo hành từ nhà sản xuất",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <CustomerServiceOutlined className="text-2xl text-green-600" />,
      title: "Bảo hành uy tín",
      description: "Chế độ bảo hành toàn diện, đổi trả trong 30 ngày đầu, hỗ trợ kỹ thuật 24/7",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <TeamOutlined className="text-2xl text-purple-600" />,
      title: "Đội ngũ chuyên nghiệp",
      description: "Nhân viên được đào tạo bài bản, am hiểu sản phẩm, tư vấn nhiệt tình và chuyên nghiệp",
      color: "from-purple-500 to-violet-500",
    },
    {
      icon: <TruckOutlined className="text-2xl text-orange-600" />,
      title: "Giao hàng nhanh chóng",
      description: "Giao hàng trong 2-4 giờ tại nội thành, 1-2 ngày toàn quốc, miễn phí với đơn từ 500k",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <GiftOutlined className="text-2xl text-pink-600" />,
      title: "Khuyến mãi hấp dẫn",
      description: "Thường xuyên có các chương trình ưu đãi, giảm giá, quà tặng giá trị cho khách hàng",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <StarOutlined className="text-2xl text-yellow-600" />,
      title: "Dịch vụ cao cấp",
      description: "Trải nghiệm mua sắm đẳng cấp với không gian hiện đại, dịch vụ chu đáo và chuyên nghiệp",
      color: "from-yellow-500 to-amber-500",
    },
  ]

  const timeline = [
    {
      color: "blue",
      children: (
        <div>
          <Title level={5} className="mb-1">
            2016 - Khởi đầu
          </Title>
          <Text className="text-gray-600">Thành lập cửa hàng đầu tiên tại Hà Nội với 5 nhân viên</Text>
        </div>
      ),
    },
    {
      color: "green",
      children: (
        <div>
          <Title level={5} className="mb-1">
            2018 - Mở rộng
          </Title>
          <Text className="text-gray-600">Phát triển thành chuỗi 10 cửa hàng, ra mắt website bán hàng online</Text>
        </div>
      ),
    },
    {
      color: "orange",
      children: (
        <div>
          <Title level={5} className="mb-1">
            2020 - Đột phá
          </Title>
          <Text className="text-gray-600">Đạt 50,000 khách hàng, trở thành đại lý ủy quyền chính thức của Apple</Text>
        </div>
      ),
    },
    {
      color: "purple",
      children: (
        <div>
          <Title level={5} className="mb-1">
            2024 - Hiện tại
          </Title>
          <Text className="text-gray-600">25+ cửa hàng toàn quốc, hệ thống bán hàng omnichannel hoàn thiện</Text>
        </div>
      ),
    },
  ]

  const teamMembers = [
    {
      name: "Phạm Minh Hiếu",
      position: "Founder & CEO",
      avatar: "/placeholder.svg?height=80&width=80",
      description: "2 năm kinh nghiệm trong ngành công nghệ",
    },
    {
      name: "Trịnh Thị Dương",
      position: "Marketing Director",
      avatar: "/placeholder.svg?height=80&width=80",
      description: "Chuyên gia marketing với 6 ngày kinh nghiệm",
    },
    {
      name: "Nguyễn Hồng Quân",
      position: "Technical Director",
      avatar: "/placeholder.svg?height=80&width=80",
      description: "Chuyên gia công nghệ và phát triển sản phẩm",
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
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-4">
              Tại sao chọn XPhone?
            </Title>
            <Text className="text-lg text-gray-600">
              Những lý do khiến hàng triệu khách hàng tin tưởng và lựa chọn XPhone
            </Text>
          </div>

          <Row gutter={[24, 24]}>
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
          </Row>
        </div>

        {/* Team */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom duration-700 delay-600">
          <div className="text-center mb-12">
            <Title level={2} className="text-3xl font-bold text-gray-800 mb-4">
              Đội ngũ lãnh đạo
            </Title>
            <Text className="text-lg text-gray-600">Những con người tạo nên thành công của XPhone</Text>
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

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <PhoneOutlined className="text-white text-lg" />
                    </div>
                    <div>
                      <Text className="text-white font-medium block">Hotline</Text>
                      <Text className="text-white/80">Hãy alo cho Hiếu: 0123.456.789</Text>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <MailOutlined className="text-white text-lg" />
                    </div>
                    <div>
                      <Text className="text-white font-medium block">Email</Text>
                      <a
                        href="mailto:trinhthiduong@gmail.com"
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        trinhthiduong@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <ClockCircleOutlined className="text-white text-lg" />
                    </div>
                    <div>
                      <Text className="text-white font-medium block">Giờ làm việc</Text>
                      <Text className="text-white/80">8:00 - 22:00 (Thứ 2 - Chủ nhật)</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <Title level={3} className="text-white mb-6 text-center">
                  Cam kết của chúng tôi
                </Title>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <SafetyOutlined className="text-white text-lg" />
                    <Text className="text-white/90">Sản phẩm chính hãng 100%</Text>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CustomerServiceOutlined className="text-white text-lg" />
                    <Text className="text-white/90">Hỗ trợ khách hàng 24/7</Text>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TruckOutlined className="text-white text-lg" />
                    <Text className="text-white/90">Giao hàng miễn phí toàn quốc</Text>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GiftOutlined className="text-white text-lg" />
                    <Text className="text-white/90">Chương trình ưu đãi hấp dẫn</Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default About