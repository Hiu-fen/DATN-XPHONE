import { message } from "antd"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useState, FormEvent, ChangeEvent } from "react"
import axios, { AxiosError } from "axios"

// Định nghĩa interface cho contact
interface Contact {
  _id: string
  name: string
  email: string
  phone: string
  date: string
  status: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

const Contact = () => {
  const [formData, setFormData] = useState<{
    name: string
    email: string
    phone: string
  }>({
    name: "",
    email: "",
    phone: "",
  })

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/ // Định dạng số điện thoại Việt Nam
    return phoneRegex.test(phone)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Kiểm tra đầu vào
    if (!formData.name || !formData.email || !formData.phone) {
      message.error("Vui lòng điền đầy đủ tên, email và số điện thoại")
      return
    }

    // Validate số điện thoại
    if (!validatePhone(formData.phone)) {
      message.error("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09 và có 10 chữ số).")
      return
    }

    // Lấy thời gian hiện tại
    const now = new Date()
    const date = now.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })

    // Tạo đối tượng thông tin gửi
    const submission = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date,
      status: false,
    }

    try {
      // Gửi dữ liệu lên API
      const response = await axios.post("http://localhost:5000/api/contacts", submission)
      
      message.success("Gửi thông tin thành công!")

      // Đặt lại form
      setFormData({
        name: "",
        email: "",
        phone: "",
      })

      // Chuyển hướng đến Gmail
      const email = "xphonene53@gmail.com"
      const subject = encodeURIComponent("Liên hệ từ XPhone Store")
      const body = encodeURIComponent(
        `Xin chào XPhone Store : <Bạn nhập nội dung cần liên hệ vào đây nhé !>\n\nThông tin liên hệ:\nHọ và tên: ${formData.name}\nEmail: ${formData.email}\nSố điện thoại: ${formData.phone}\n\nTrân trọng,`
      )
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`
      window.open(gmailUrl, "_blank")
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>
      const errorMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error || "Không thể gửi thông tin. Vui lòng thử lại."
      message.error(errorMessage)
      console.error("Lỗi khi gửi thông tin:", {
        message: errorMessage,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Phần tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Điền thông tin dưới đây để liên hệ.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin liên hệ */}
          <div className="lg:col-span-1 space-y-6">
            {/* Thẻ thông tin cửa hàng */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">XPhone Store</h2>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Hệ thống cửa hàng XPhone chuyên bán lẻ điện thoại, máy tính laptop, smartwatch, smartphone, phụ kiện chính
                hãng - Giá tốt, giao miễn phí.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
                    <p className="text-gray-600">0123 456 789</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">trinhthiduong@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                    <p className="text-gray-600">8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Hỗ trợ khách hàng</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Sản phẩm chính hãng</div>
              </div>
            </div>
          </div>

          {/* Form liên hệ */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form liên hệ */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Gửi thông tin liên hệ</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập email của bạn"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số điện thoại (VD: 0935123456)"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  Gửi thông tin
                </button>
              </form>
            </div>

            {/* Bản đồ */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Vị trí cửa hàng</h3>
                </div>
              </div>
              <div className="relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8639311820666!2d105.74468687503176!3d21.03812978061353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1747882891526!5m2!1svi!2s"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-red-500" />
                    XPhone Store
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần thông tin bổ sung */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Gọi điện trực tiếp</h3>
            <p className="text-gray-600 mb-4">Liên hệ ngay với chúng tôi qua hotline</p>
            <a href="tel:0123456789" className="text-blue-600 font-semibold hover:text-blue-700">
              0123 456 789
            </a>
          </div>

          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Gửi email</h3>
            <p className="text-gray-600 mb-4">Gửi email cho chúng tôi để được hỗ trợ</p>
            <a href="mailto:trinhthiduong@gmail.com" className="text-green-600 font-semibold hover:text-green-700">
              trinhthiduong@gmail.com
            </a>
          </div>

          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ghé thăm cửa hàng</h3>
            <p className="text-gray-600 mb-4">Đến trực tiếp cửa hàng để trải nghiệm</p>
            <span className="text-purple-600 font-semibold">Trịnh Văn Bô, Hà Nội</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact