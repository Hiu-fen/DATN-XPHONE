
import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { FaEye, FaMapMarkerAlt, FaCreditCard, FaBoxOpen, FaShoppingBag, FaStar } from "react-icons/fa"
import { message } from "antd"

interface Order {
  _id: string
  orderCode: string
  total: number
  status: string
  date: string
  items: OrderItem[]
  paymentMethod?: string
  address: string
}

interface OrderItem {
  productId: string
  productName: string
  soluong: number
  price: number
  color: string
  storage: string
}

interface User {
  _id: string
  name: string
  email?: string
}

interface UniqueProduct {
  productId: string
  productName: string
  totalQuantity: number
  price: number
  variants: string[]
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [uniqueProducts, setUniqueProducts] = useState<UniqueProduct[]>([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [comments, setComments] = useState<{ [key: string]: string }>({})
  const [ratings, setRatings] = useState<{ [key: string]: number }>({})
  const [reviewLoading, setReviewLoading] = useState(false)

  
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({})


  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("reviewedOrders")
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const user: User | null = useMemo(() => {
  return JSON.parse(localStorage.getItem("user") || "null")
}, [])

useEffect(() => {
  if (!user?._id) {
    setLoading(false)
    return
  }

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`)
      setOrders(res.data)

      const allProductIds = res.data.flatMap((order: Order) =>
        order.items.map((item) => item.productId)
      )
      const uniqueProductIds = [...new Set(allProductIds)] as string[]

      if (uniqueProductIds.length > 0) {
        const imagePromises = uniqueProductIds.map((id) =>
          axios.get(`http://localhost:5000/api/products/${id}`)
        )
        const imageResponses = await Promise.all(imagePromises)

        const imageMap: { [key: string]: string } = {}
        imageResponses.forEach((res, index) => {
          if (res.data) {
            imageMap[uniqueProductIds[index]] = res.data.image || "/placeholder-image.png"
          }
        })
        setProductImages(imageMap)
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchOrders()
}, [user?._id])


  // Tạo danh sách sản phẩm duy nhất từ đơn hàng
  const getUniqueProducts = (order: Order): UniqueProduct[] => {
    const productMap = new Map<string, UniqueProduct>()

    order.items.forEach((item) => {
      if (productMap.has(item.productId)) {
        const existing = productMap.get(item.productId)!
        existing.totalQuantity += item.soluong
        // Thêm variant nếu chưa có
        const variantInfo = []
        if (item.color) variantInfo.push(`Màu: ${item.color}`)
        if (item.storage) variantInfo.push(`Dung lượng: ${item.storage}`)
        const variantString = variantInfo.join(", ")
        if (variantString && !existing.variants.includes(variantString)) {
          existing.variants.push(variantString)
        }
      } else {
        const variantInfo = []
        if (item.color) variantInfo.push(`Màu: ${item.color}`)
        if (item.storage) variantInfo.push(`Dung lượng: ${item.storage}`)
        const variantString = variantInfo.join(", ")

        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.soluong,
          price: item.price,
          variants: variantString ? [variantString] : [],
        })
      }
    })

    return Array.from(productMap.values())
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "chờ xử lý":
      case "chờ xác nhận":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
      case "đang xử lý":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
      case "đang giao":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
      case "đã giao":
      case "hoàn thành":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
      case "đã hủy":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cod":
      case "tiền mặt":
        return <FaBoxOpen className="w-4 h-4 text-orange-500" />
      case "card":
      case "thẻ":
      case "momo":
      case "bank":
        return <FaCreditCard className="w-4 h-4 text-blue-500" />
      default:
        return <FaCreditCard className="w-4 h-4 text-gray-500" />
    }
  }

  // Kiểm tra xem đơn hàng đã hoàn thành chưa
  const isOrderCompleted = (status: string) => {
    const completedStatuses = ["delivered", "đã giao", "hoàn thành", "giao thành công"]
    return completedStatuses.some((s) => status.toLowerCase().includes(s.toLowerCase()))
  }

  // Mở modal đánh giá
  const openReviewModal = (order: Order) => {
    const uniqueProds = getUniqueProducts(order)
    setUniqueProducts(uniqueProds)
    setSelectedOrder(order)
    setCurrentProductIndex(0)
    setComments({})
    setRatings({})
    setShowReviewModal(true)
  }

  // Xử lý thay đổi comment
  const handleCommentChange = (productId: string, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [productId]: comment,
    }))
  }

  // Xử lý thay đổi rating
  const handleRatingChange = (productId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [productId]: rating,
    }))
  }

  // Gửi đánh giá
  const submitReview = async (productId: string, productName: string) => {
    const comment = comments[productId]
    const rating = ratings[productId]

    if (!rating) {
      message.warning("Vui lòng chọn số sao đánh giá!")
      return
    }

    if (!comment?.trim()) {
      message.warning("Vui lòng nhập đánh giá!")
      return
    }

    try {
      setReviewLoading(true)
      const userName = user?.name || "Khách hàng"

      await axios.post("http://localhost:5000/api/comments", {
        sanpham: productId,
        user: userName,
        content: `⭐ Đánh giá ${rating}/5 sao: ${comment.trim()}`,
        date: new Date().toISOString(),
        status: true,
        likes: 0,
        isReview: true,
        rating: rating,
        orderId: selectedOrder?._id,
      })

      message.success(`Đánh giá sản phẩm "${productName}" thành công!`)

      // Lưu trạng thái đã đánh giá
      if (selectedOrder) {
        const newReviewedOrders = new Set([...reviewedOrders, selectedOrder._id])
        setReviewedOrders(newReviewedOrders)
        localStorage.setItem("reviewedOrders", JSON.stringify([...newReviewedOrders]))
      }

      if (currentProductIndex < uniqueProducts.length - 1) {
        setCurrentProductIndex((prev) => prev + 1)
      } else {
        handleCloseReviewModal()
      }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error)
      message.error("Gửi đánh giá thất bại!")
    } finally {
      setReviewLoading(false)
    }
  }


  // Đóng modal
  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    setSelectedOrder(null)
    setUniqueProducts([])
    setCurrentProductIndex(0)
    setComments({})
    setRatings({})
  }

  if (loading) {
    return (
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải lịch sử đơn hàng...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 pt-8">
              <div className="flex items-center gap-3 mb-2">
                <FaShoppingBag className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
              </div>
              <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
            </div>

            {orders.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-500 mb-6">Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Bắt đầu mua sắm
                </Link>
              </div>
            ) : (
              /* Orders Table */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Mobile View */}
                <div className="block lg:hidden">
                  <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link
                            to={`/history/${order._id}`}
                            className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            #{order.orderCode}
                          </Link>
                            
                            <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString("vi-VN")}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Số sản phẩm</p>
                            <p className="font-medium text-gray-900">{order.items?.length || 0} sản phẩm</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tổng tiền</p>
                            <p className="font-semibold text-green-600 text-lg">{order.total.toLocaleString()} đ</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getPaymentMethodIcon(order.paymentMethod || "")}
                            <span className="text-sm text-gray-700">{order.paymentMethod || "Chưa rõ"}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 line-clamp-2">{order.address}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/history/${order._id}`}
                            className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <FaEye className="w-4 h-4" />
                            Xem chi tiết
                          </Link>
                          {isOrderCompleted(order.status) && !reviewedOrders.has(order._id) && (
                            <button
                              onClick={() => openReviewModal(order)}
                              className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                            >
                              <FaStar className="w-4 h-4" />
                              Đánh giá
                            </button>
                          )}
                          {reviewedOrders.has(order._id) && (
                            <div className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">
                              <FaStar className="w-4 h-4" />
                              Đã đánh giá
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã đơn hàng
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số SP
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng tiền
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đặt
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thanh toán
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Địa chỉ
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-5 py-4">
                          <Link
                            to={`/history/${order._id}`}
                            className="text-blue-600 font-semibold hover:underline truncate block max-w-[160px]"
                          >
                            #{order.orderCode}
                          </Link>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order.items?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-lg font-semibold text-green-600">
                              {order.total.toLocaleString()} đ
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                            {new Date(order.date).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getPaymentMethodIcon(order.paymentMethod || "")}
                              <span className="text-sm text-gray-700">{order.paymentMethod || "Chưa rõ"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                            <div className="flex items-start gap-2">
                              <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="truncate">{order.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex gap-2 justify-center">

                              {isOrderCompleted(order.status) && !reviewedOrders.has(order._id) && (
                                <button
                                  onClick={() => openReviewModal(order)}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                                >
                                  <FaStar className="w-4 h-4" />
                                  Đánh giá
                                </button>
                              )}
                              {reviewedOrders.has(order._id) && (
                                <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                                  <FaStar className="w-4 h-4" />
                                  Đã đánh giá
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {orders.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaShoppingBag className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                      <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaCreditCard className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tổng chi tiêu</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaBoxOpen className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Đã hoàn thành</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {orders.filter((order) => isOrderCompleted(order.status)).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal đánh giá sản phẩm */}
      {showReviewModal && selectedOrder && uniqueProducts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold text-green-600 mb-2">💬 Đánh giá sản phẩm</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sản phẩm ({currentProductIndex + 1}/{uniqueProducts.length})
              </p>

              {uniqueProducts[currentProductIndex] && (
                <>
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    {/* Thêm hình ảnh sản phẩm */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={productImages[uniqueProducts[currentProductIndex].productId] || "/placeholder-image.png"}
                        alt={uniqueProducts[currentProductIndex].productName}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-lg mb-1">
                          {uniqueProducts[currentProductIndex].productName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Giá: {uniqueProducts[currentProductIndex].price.toLocaleString()} đ
                        </p>
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <p className="text-sm text-gray-600">
                        Tổng số lượng: {uniqueProducts[currentProductIndex].totalQuantity}
                      </p>
                      {uniqueProducts[currentProductIndex].variants.map((variant, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {variant}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Đánh giá sao */}
                  <div className="mb-6 text-center">
                    <p className="mb-4 text-lg font-semibold text-gray-800">Bạn cảm thấy sản phẩm này như thế nào?</p>
                    <div className="flex justify-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`text-4xl transition-all hover:scale-110 ${
                            star <= (ratings[uniqueProducts[currentProductIndex].productId] || 0)
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                          onClick={() => handleRatingChange(uniqueProducts[currentProductIndex].productId, star)}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    {ratings[uniqueProducts[currentProductIndex].productId] && (
                      <p className="text-lg font-medium text-yellow-600">
                        {ratings[uniqueProducts[currentProductIndex].productId]} sao -{" "}
                        {ratings[uniqueProducts[currentProductIndex].productId] === 5
                          ? "Rất hài lòng"
                          : ratings[uniqueProducts[currentProductIndex].productId] === 4
                            ? "Hài lòng"
                            : ratings[uniqueProducts[currentProductIndex].productId] === 3
                              ? "Bình thường"
                              : ratings[uniqueProducts[currentProductIndex].productId] === 2
                                ? "Không hài lòng"
                                : "Rất không hài lòng"}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="mb-2 font-medium">Chia sẻ trải nghiệm của bạn về sản phẩm này:</p>
                  </div>

                  <div className="mb-6">
                    <textarea
                      placeholder="Viết đánh giá của bạn về sản phẩm này..."
                      value={comments[uniqueProducts[currentProductIndex].productId] || ""}
                      onChange={(e) =>
                        handleCommentChange(uniqueProducts[currentProductIndex].productId, e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() =>
                        submitReview(
                          uniqueProducts[currentProductIndex].productId,
                          uniqueProducts[currentProductIndex].productName,
                        )
                      }
                      disabled={reviewLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                    >
                      {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                    <button
                      onClick={handleCloseReviewModal}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                    >
                      Đóng
                    </button>
                  </div>

                  {uniqueProducts.length > 1 && (
                    <div className="mt-4 flex justify-center">
                      <div className="flex gap-1">
                        {uniqueProducts.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentProductIndex ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrderHistory
