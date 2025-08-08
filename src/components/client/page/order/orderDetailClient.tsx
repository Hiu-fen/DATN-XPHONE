"use client"
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { createPortal } from "react-dom"
import axios from "axios"
import socket from "../../../../socket"
import {
  ArrowLeft,
  DollarSign,
  Package,
  MapPin,
  CreditCard,
  ClipboardList,
  Trash2,
  X,
  Check,
  AlertTriangle,
  PackageOpen,
  User,
  Phone,
  Home,
  ShoppingBag,
  Clock,
  CheckCircle,
  Gift,
  Star,
  FileText,
  Download,
  Printer,
  Building,
  Mail,
  UserCheck,
} from "lucide-react"
import { getPaymentStatusColor, getStatusColor, getStatusIcon } from "./ItemOrderDetail"
import { message } from "antd"

interface Item {
  productName: string
  soluong: number
  price: number
  snapshot: {
    image?: string
    color?: string
    storage?: string
  }
}

// Thêm interface cho thông tin người đặt và người nhận
interface OrdererInfo {
  name: string
  phone: string
  email: string
}

interface RecipientInfo {
  name: string
  phone: string
  email?: string
  address: string
  note?: string
}

interface Order {
  _id: string
  orderCode: string
  total: number
  status: string
  date: string
  items: Item[]
  paymentMethod?: string
  customerName: string
  phone: string
  address: string
  email?: string
  // Thông tin mới
  ordererInfo?: OrdererInfo
  recipientInfo?: RecipientInfo
  cancelReason?: string
  returnStatus?: string
  paymentStatus?: string
  statusHistory?: { status: string; timestamp: string }[]
  returnStatusHistory?: { status: string; timestamp: string }[]
  shippingFee?: number
  voucherCode?: string
  voucherDiscount?: number
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isCancelDisabled, setIsCancelDisabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success")

  const cancelReasons = [
    "Sản phẩm không còn nhu cầu",
    "Lỗi thông tin sản phẩm",
    "Nhận được sản phẩm bị lỗi",
    "Đặt nhầm sản phẩm",
    "Khác",
  ]

  const showToastMessage = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSaveInvoice = () => {
    const printContent = document.getElementById("invoice-content")
    if (printContent) {
      const originalContent = document.body.innerHTML
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${id}`)
        const orderData = response.data

        // DEBUG: Log dữ liệu thô từ database
        console.log("🔍 RAW ORDER DATA:", orderData)
        console.log("🔍 ordererInfo:", orderData.ordererInfo)
        console.log("🔍 recipientInfo:", orderData.recipientInfo)
        console.log("🔍 customerName:", orderData.customerName)
        console.log("🔍 phone:", orderData.phone)
        console.log("🔍 email:", orderData.email)

        setOrder(orderData)
        if (orderData.status !== "Chờ xác nhận") {
          setIsCancelDisabled(true)
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err)
        showToastMessage("Không thể tải thông tin đơn hàng", "error")
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchOrder()
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    const handleOrderUpdated = (updatedOrder: Order) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder)
        showToastMessage("Đơn hàng đã được cập nhật từ Admin", "success")
        if (updatedOrder.status !== "Chờ xác nhận") {
          setIsCancelDisabled(true)
        }
      }
    }
    socket.on("orderUpdated", handleOrderUpdated)
    return () => {
      socket.off("orderUpdated", handleOrderUpdated)
    }
  }, [id])

  const confirmReceived = async () => {
    if (!order) return
    try {
      await axios.patch(`http://localhost:5000/api/orders/${order._id}`, {
        status: "Đã nhận hàng",
      })
      message.success("Đã xác nhận bạn đã nhận hàng.")
      setOrder((prev: any) => ({ ...prev, status: "Đã nhận hàng" }))
      setIsLoyaltyModalOpen(true)
    } catch (error) {
      message.error("Xác nhận thất bại!")
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      showToastMessage("Vui lòng chọn lý do hủy đơn hàng", "warning")
      return
    }
    if (cancelReason === "Khác") {
      const reason = customReason.trim()
      if (!reason) {
        showToastMessage("Vui lòng nhập lý do hủy đơn hàng!", "warning")
        return
      }
      if (reason.length < 6) {
        showToastMessage("Lý do hủy đơn hàng phải tối thiểu 6 ký tự!", "warning")
        return
      }
    }
    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, {
        status: "Đã huỷ",
        cancelReason: cancelReason === "Khác" ? customReason : cancelReason,
      })
      showToastMessage("Đơn hàng đã được hủy thành công", "success")
      setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: "Đã huỷ" } : prevOrder))
      setIsModalOpen(false)
      setIsCancelDisabled(true)
    } catch (err) {
      console.error("Lỗi khi hủy đơn:", err)
      showToastMessage("Không thể hủy đơn hàng. Vui lòng thử lại", "error")
    }
  }

  // Helper functions để lấy thông tin người đặt và người nhận
  const getOrdererInfo = () => {
    if (!order) return null

    console.log("🔍 getOrdererInfo - order.ordererInfo:", order.ordererInfo)

    // Ưu tiên lấy từ ordererInfo trước
    if (order.ordererInfo && order.ordererInfo.name && order.ordererInfo.phone) {
      const result = {
        name: order.ordererInfo.name,
        phone: order.ordererInfo.phone,
        email: order.ordererInfo.email,
      }
      console.log("🔍 getOrdererInfo - từ ordererInfo:", result)
      return result
    }

    // Fallback về thông tin cũ (customerName, phone, email) - đây là thông tin người đặt hàng
    const result = {
      name: order.customerName || "Chưa có thông tin",
      phone: order.phone || "Chưa có thông tin",
      email: order.email || "Chưa có thông tin",
    }
    console.log("🔍 getOrdererInfo - từ fallback:", result)
    return result
  }

  const getRecipientInfo = () => {
    if (!order) return null

    console.log("🔍 getRecipientInfo - order.recipientInfo:", order.recipientInfo)

    // Ưu tiên lấy từ recipientInfo trước
    if (order.recipientInfo && order.recipientInfo.name && order.recipientInfo.phone) {
      const result = {
        name: order.recipientInfo.name,
        phone: order.recipientInfo.phone,
        email: order.recipientInfo.email || "Chưa có thông tin",
        address: order.recipientInfo.address,
        note: order.recipientInfo.note || "",
      }
      console.log("🔍 getRecipientInfo - từ recipientInfo:", result)
      return result
    }

    // Fallback về thông tin cũ - nhưng chỉ khi không có recipientInfo
    const result = {
      name: order.customerName || "Chưa có thông tin",
      phone: order.phone || "Chưa có thông tin",
      email: order.email || "Chưa có thông tin",
      address: order.address || "Chưa có thông tin",
      note: "",
    }
    console.log("🔍 getRecipientInfo - từ fallback:", result)
    return result
  }

  // Kiểm tra xem người đặt và người nhận có giống nhau không
  const isSamePerson = () => {
    if (!order) return true

    const orderer = getOrdererInfo()
    const recipient = getRecipientInfo()

    console.log("🔍 isSamePerson - orderer:", orderer)
    console.log("🔍 isSamePerson - recipient:", recipient)

    if (!orderer || !recipient) return true

    // So sánh tên và số điện thoại
    const same = orderer.name === recipient.name && orderer.phone === recipient.phone
    console.log("🔍 isSamePerson - result:", same)
    return same
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử
          </Link>
        </div>
      </div>
    )
  }

  const ordererInfo = getOrdererInfo()
  const recipientInfo = getRecipientInfo()
  const samePerson = isSamePerson()

  return (
    <div className="min-h-screen mx-4 border-t border-gray-200 bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
              toastType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : toastType === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
            }`}
          >
            {toastType === "success" && <Check className="w-5 h-5" />}
            {toastType === "error" && <X className="w-5 h-5" />}
            {toastType === "warning" && <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h1>
            <p className="text-gray-600 text-lg">Mã đơn hàng: #{order.orderCode}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200"
            >
              <FileText className="w-4 h-4" />
              Xem hóa đơn
            </button>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại lịch sử
            </Link>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin đơn hàng</h2>
            </div>
            <div className="space-y-8">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Trạng thái đơn hàng</span>
                  </div>
                  <span
                    className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Thanh toán</span>
                  </div>
                  <span
                    className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getPaymentStatusColor(
                      order.paymentStatus || "",
                    )}`}
                  >
                    {order.paymentStatus || "Chưa thanh toán"}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Phương thức</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">{order.paymentMethod || "COD"}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Số sản phẩm</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">{order.items.length} sản phẩm</p>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Thông tin người đặt hàng và người nhận hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Thông tin người đặt hàng */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Thông tin người đặt hàng</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Họ và tên</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ordererInfo?.name || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Số điện thoại</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ordererInfo?.phone || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {ordererInfo?.email || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin người nhận hàng */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Thông tin người nhận hàng</h3>
                    {samePerson && (
                      <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Cùng người đặt
                      </span>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Họ và tên</p>
                        <p className={`text-lg font-semibold ${samePerson ? "text-gray-900" : "text-green-700"}`}>
                          {recipientInfo?.name || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Số điện thoại</p>
                        <p className={`text-lg font-semibold ${samePerson ? "text-gray-900" : "text-green-700"}`}>
                          {recipientInfo?.phone || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                    {recipientInfo?.email && recipientInfo.email !== "Chưa có thông tin" && (
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                          <p className={`text-lg font-semibold ${samePerson ? "text-gray-900" : "text-green-700"}`}>
                            {recipientInfo.email}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Home className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">Địa chỉ giao hàng</p>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <p className="text-gray-900 leading-relaxed">
                            {recipientInfo?.address || "Chưa có thông tin"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {recipientInfo?.note && (
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <ClipboardList className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500 mb-2">Ghi chú</p>
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-gray-900 leading-relaxed">{recipientInfo.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Return Status (if exists) */}
              {order.returnStatus && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <PackageOpen className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-700 mb-1">Trạng thái trả hàng</p>
                      <span
                        className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                          order.returnStatus,
                        )}`}
                      >
                        {order.returnStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="shadow-lg border-0 rounded-2xl bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
            </div>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.snapshot?.image ? (
                        <img
                          src={item.snapshot.image || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-xl border border-gray-200 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-xl mb-4">{item.productName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">Màu sắc</span>
                          <p className="font-semibold text-gray-900">{item.snapshot?.color || "Không xác định"}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">Bộ nhớ</span>
                          <p className="font-semibold text-gray-900">
                            {item.snapshot?.storage ? `${item.snapshot.storage} GB` : "Không xác định"}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">Số lượng</span>
                          <p className="font-semibold text-gray-900">{item.soluong}</p>
                        </div>
                      </div>
                    </div>
                    {/* Price */}
                    <div className="flex-shrink-0 text-right bg-white rounded-xl p-6 border border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Đơn giá</div>
                          <div className="font-semibold text-gray-900 text-lg">{item.price.toLocaleString()} đ</div>
                        </div>
                        <hr className="border-gray-200" />
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Thành tiền</div>
                          <div className="text-2xl font-bold text-green-600">
                            {(item.price * item.soluong).toLocaleString()} đ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="shadow-lg border-0 rounded-2xl bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Lịch sử trạng thái đơn hàng</h2>
              </div>
              <div className="space-y-4">
                {order.statusHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">{getStatusIcon(entry.status)}</div>
                    <div className="flex-1">
                      <span
                        className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                          entry.status,
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Return Status History */}
        {order.returnStatusHistory && order.returnStatusHistory.length > 0 && (
          <div className="shadow-lg border-0 rounded-2xl bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PackageOpen className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Lịch sử trạng thái trả hàng</h2>
              </div>
              <div className="space-y-4">
                {order.returnStatusHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <PackageOpen className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span
                        className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                          entry.status,
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {new Date(entry.timestamp).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions and Total */}
        <div className="shadow-lg border-0 rounded-2xl bg-gradient-to-r from-white to-gray-50">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isCancelDisabled}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isCancelDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {isCancelDisabled ? "Không thể hủy" : "Hủy đơn hàng"}
                </button>
                <Link
                  to={`/return/${id}`}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    order.status !== "Giao thành công" || !!order.returnStatus
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                      : "bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                  }`}
                >
                  <PackageOpen className="w-4 h-4" />
                  {order.returnStatus ? "Đã yêu cầu trả hàng" : "Yêu cầu trả hàng"}
                </Link>
                {(order.status === "Giao thành công" && !order.returnStatus) || order.returnStatus === "Từ chối" ? (
                  <button
                    onClick={confirmReceived}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Đã nhận hàng
                  </button>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">Phí vận chuyển</p>
                <p className="text-lg text-gray-800 font-semibold mb-2">
                  {order.paymentStatus === "Đã hoàn tiền" ? "0" : order.shippingFee?.toLocaleString() || "0"} đ
                </p>
                {order.voucherCode && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Voucher áp dụng</p>
                    <p className="text-lg font-semibold text-green-700">{order.voucherCode}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-2">Tổng thanh toán</p>
                <div className="flex items-center gap-3 text-3xl font-bold text-green-600">
                  <DollarSign className="w-8 h-8" />
                  {order.paymentStatus === "Đã hoàn tiền" ? (
                    <span>
                      0 đ <span className="text-sm text-gray-500">(Đã hoàn tiền)</span>
                    </span>
                  ) : (
                    `${order.total.toLocaleString()} đ`
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Hủy đơn hàng</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vui lòng chọn lý do hủy đơn hàng:
                  </label>
                  <div className="space-y-3">
                    {cancelReasons.map((reason, idx) => (
                      <label
                        key={idx}
                        className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={(e) => {
                            setCancelReason(e.target.value)
                            if (e.target.value !== "Khác") setCustomReason("")
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{reason}</span>
                      </label>
                    ))}
                    {cancelReason === "Khác" && (
                      <div className="mt-4">
                        <textarea
                          value={customReason}
                          onChange={(e) => {
                            if (e.target.value.length <= 200) {
                              setCustomReason(e.target.value)
                            }
                          }}
                          maxLength={200}
                          rows={3}
                          placeholder="Nhập lý do khác..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span className="text-red-400 italic">Lí do phải tối thiểu 6 ký tự và tối đa 200 ký tự</span>
                          <span>{customReason.length}/200</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={!cancelReason}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      cancelReason
                        ? "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Xác nhận hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loyalty Point Modal */}
        {isLoyaltyModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Chúc mừng bạn!</h3>
                <div className="mb-6">
                  <p className="text-gray-600 text-lg mb-4">Bạn đã xác nhận nhận hàng thành công và được tặng</p>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Star className="w-8 h-8 text-yellow-600 fill-current" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">+1 Điểm</div>
                        <div className="text-sm text-yellow-700 font-medium">Điểm thành viên</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-4">
                    Điểm sẽ được cộng vào tài khoản của bạn và có thể sử dụng cho các đơn hàng tiếp theo
                  </p>
                </div>
                <button
                  onClick={() => setIsLoyaltyModalOpen(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  Tuyệt vời!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal using Portal */}
      {isInvoiceModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4"
            style={{
              zIndex: 2147483647,
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
            }}
            onClick={() => setIsInvoiceModalOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "95vh" }}
            >
              {/* Header - Sticky */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">Hóa đơn điện tử</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveInvoice}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Lưu hóa đơn
                  </button>
                  <button
                    onClick={handlePrintInvoice}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <Printer className="w-4 h-4" />
                    In hóa đơn
                  </button>
                  <button
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* Scrollable content */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(95vh - 80px)" }}>
                {/* Invoice Content */}
                <div id="invoice-content" className="p-8 bg-white">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Building className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">Xphone</h1>
                          <p className="text-gray-600">Cửa hàng điện tử hàng đầu</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>123 Đường ABC, Quận 1, TP.HCM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>0123 456 789</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>contact@xphone.com</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">HÓA ĐƠN BÁN HÀNG</h2>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Số hóa đơn:</span> #{order.orderCode}
                        </p>
                        <p>
                          <span className="font-medium">Ngày tạo:</span> {new Date().toLocaleDateString("vi-VN")}
                        </p>
                        <p>
                          <span className="font-medium">Ngày đặt hàng:</span>{" "}
                          {new Date(order.date).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Customer Information - Updated to show both orderer and recipient */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Thông tin người đặt hàng */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        Thông tin người đặt hàng
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                          <p className="font-semibold text-gray-900">{ordererInfo?.name || "Chưa có thông tin"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{ordererInfo?.phone || "Chưa có thông tin"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-semibold text-gray-900">{ordererInfo?.email || "Chưa có thông tin"}</p>
                        </div>
                      </div>
                    </div>
                    {/* Thông tin người nhận hàng */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Thông tin người nhận hàng
                        {samePerson && (
                          <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Cùng người đặt
                          </span>
                        )}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                          <p className="font-semibold text-gray-900">{recipientInfo?.name || "Chưa có thông tin"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                          <p className="font-semibold text-gray-900">{recipientInfo?.phone || "Chưa có thông tin"}</p>
                        </div>
                        {recipientInfo?.email && recipientInfo.email !== "Chưa có thông tin" && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="font-semibold text-gray-900">{recipientInfo.email}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                          <p className="font-semibold text-gray-900">{recipientInfo?.address || "Chưa có thông tin"}</p>
                        </div>
                        {recipientInfo?.note && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                            <p className="font-semibold text-gray-900">{recipientInfo.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Products Table */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết sản phẩm</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">STT</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Tên sản phẩm</th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Thông số</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Số lượng</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Đơn giá</th>
                            <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                              <td className="border border-gray-300 px-4 py-3 font-medium">{item.productName}</td>
                              <td className="border border-gray-300 px-4 py-3">
                                <div className="space-y-1 text-sm">
                                  <div>Màu: {item.snapshot?.color || "N/A"}</div>
                                  <div>Bộ nhớ: {item.snapshot?.storage ? `${item.snapshot.storage} GB` : "N/A"}</div>
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">{item.soluong}</td>
                              <td className="border border-gray-300 px-4 py-3 text-right">
                                {item.price.toLocaleString()} đ
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                                {(item.price * item.soluong).toLocaleString()} đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-xl p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng kết thanh toán</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span className="font-semibold">
                          {order.paymentStatus === "Đã hoàn tiền"
                            ? "0"
                            : order.items
                                .reduce((sum, item) => sum + item.price * item.soluong, 0)
                                .toLocaleString()}{" "}
                          đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-semibold">
                          {order.paymentStatus === "Đã hoàn tiền" ? "0" : order.shippingFee?.toLocaleString() || "0"} đ
                        </span>
                      </div>
                      {order.voucherCode && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá ({order.voucherCode}):</span>
                          <span className="font-semibold">
                            {order.paymentStatus === "Đã hoàn tiền"
                              ? "0"
                              : `-${order.voucherDiscount?.toLocaleString() || "0"}`}{" "}
                            đ
                          </span>
                        </div>
                      )}
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-green-600">{order.total.toLocaleString()} đ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-semibold">{order.paymentMethod || "COD"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trạng thái thanh toán:</span>
                        <span className={`font-semibold ${getPaymentStatusColor(order.paymentStatus || "")}`}>
                          {order.paymentStatus || "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Cảm ơn bạn đã mua hàng tại Xphone!</p>
                        <p>Mọi thắc mắc xin liên hệ: 0123 456 789</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Hóa đơn được tạo tự động</p>
                        <p>Ngày in: {new Date().toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default OrderDetail
