"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import {
  FaEye,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBoxOpen,
  FaShoppingBag,
  FaStar,
  FaCheck,
  FaTrophy,
} from "react-icons/fa"
import { message, Radio } from "antd"
import socket from "../../../../socket"

interface Order {
  _id: string
  orderCode: string
  total: number
  originalTotal?: number
  refundedAmount?: number
  refunds?: { amount?: number; status?: string }[]
  status: string
  date: string
  items: OrderItem[]
  paymentMethod?: string
  address: string
  isPaid: boolean
  returnStatus?: string // Tracks return request status
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

const statusOptions: string[] = [
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang giao",
  "Giao thành công",
  "Đã nhận hàng",
  "Đã huỷ",
  "Trả hàng/Hoàn tiền",
  "Chưa thanh toán",
]

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
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({})
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("reviewedOrders")
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [timeLeftMap, setTimeLeftMap] = useState<{ [key: string]: number }>({})
  const [showAchievementNotification, setShowAchievementNotification] = useState(false)
  const [showThankYouReviewModal, setShowThankYouReviewModal] = useState(false)

  const user: User | null = useMemo(() => {
    return JSON.parse(localStorage.getItem("user") || "null")
  }, [])

  const computeOrderTotals = (order: Order) => {
    const refundedFromField = typeof order.refundedAmount === "number" ? order.refundedAmount : 0
    const refundedFromArray =
      Array.isArray(order.refunds) && order.refunds.length > 0
        ? order.refunds
            .filter((r) => (r.status || "").toLowerCase().includes("success"))
            .reduce((s, r) => s + (r.amount || 0), 0)
        : 0
    const refundedAmount = Math.max(refundedFromField, refundedFromArray)
    let originalTotal: number
    if (typeof order.originalTotal === "number") {
      originalTotal = order.originalTotal
    } else {
      originalTotal = (typeof order.total === "number" ? order.total : 0) + refundedAmount
    }
    const remaining = Math.max(0, originalTotal - refundedAmount)
    return { originalTotal, refundedAmount, remaining }
  }

  const filteredOrders = useMemo(() => {
    let sorted = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (statusFilter === "Chưa thanh toán") {
      sorted = sorted.filter((order) => order.paymentMethod === "VNPAY" && !order.isPaid)
    } else if (statusFilter !== "all") {
      sorted = sorted.filter((order) =>
        order.status.toLowerCase().replace(/\s/g, "").includes(statusFilter.toLowerCase().replace(/\s/g, ""))
      )
    }
    return sorted
  }, [orders, statusFilter])

  useEffect(() => {
    const handleOrderUpdated = (updatedOrder: any) => {
      if (updatedOrder.userId !== user?._id) return
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === updatedOrder._id)
        if (exists) {
          return prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
        }
        return [updatedOrder, ...prev]
      })
    }
    socket.on("orderUpdated", handleOrderUpdated)
    return () => {
      socket.off("orderUpdated", handleOrderUpdated)
    }
  }, [user?._id])

  useEffect(() => {
    if (!user?._id) {
      setLoading(false)
      return
    }
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`)
        setOrders(res.data)
        const allProductIds = res.data.flatMap((order: Order) => order.items.map((item) => item.productId))
        const uniqueProductIds = [...new Set(allProductIds)] as string[]
        if (uniqueProductIds.length > 0) {
          const imagePromises = uniqueProductIds.map((id) => axios.get(`http://localhost:5000/api/products/${id}`))
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

  useEffect(() => {
    const timers: { [key: string]: NodeJS.Timeout } = {}
    if (orders) {
      orders.forEach((order) => {
        if (order.paymentMethod === "VNPAY" && !order.isPaid) {
          const orderDate = new Date(order.date).getTime()
          const currentTime = new Date().getTime()
          const timeElapsed = Math.floor((currentTime - orderDate) / 1000)
          let remainingTime = 300 - timeElapsed
          if (remainingTime > 0) {
            setTimeLeftMap((prev) => ({ ...prev, [order._id]: remainingTime }))
            timers[order._id] = setInterval(() => {
              setTimeLeftMap((prev) => {
                const newTime = (prev[order._id] || 0) - 1
                if (newTime <= 0) {
                  clearInterval(timers[order._id])
                  refetchOrders()
                  return { ...prev, [order._id]: 0 }
                }
                return { ...prev, [order._id]: newTime }
              })
            }, 1000)
          } else {
            setTimeLeftMap((prev) => ({ ...prev, [order._id]: 0 }))
            refetchOrders()
          }
        }
      })
      return () => {
        Object.values(timers).forEach((timer) => clearInterval(timer))
      }
    }
  }, [orders])

  const refetchOrders = async () => {
    if (user?._id) {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/user/${user._id}`)
        setOrders(res.data)
      } catch (err) {
        console.error("Lỗi khi refetch orders:", err)
      }
    }
  }

  const confirmReceived = async (orderId: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}`, {
        status: "Đã nhận hàng",
      })
      message.success("Xác nhận đã nhận hàng thành công!")
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: "Đã nhận hàng" } : o)))
      setShowAchievementNotification(true)
    } catch (error) {
      message.error("Xác nhận thất bại!")
    }
  }

  const handlePayNow = async (order: Order) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/vnpay/create_payment_url`, {
        orderCode: order.orderCode,
        orderId: order._id,
        amount: order.total
      })
      if (res.data.success) {
        window.location.href = res.data.paymentUrl
      } else {
        message.error(res.data.message || "Lỗi khi tạo liên kết thanh toán!")
      }
    } catch (err) {
      console.error("Lỗi handlePayNow:", err)
      message.error("Lỗi khi tạo liên kết thanh toán!")
    }
  }

  const getUniqueProducts = (order: Order): UniqueProduct[] => {
    const productMap = new Map<string, UniqueProduct>()
    order.items.forEach((item) => {
      if (productMap.has(item.productId)) {
        const existing = productMap.get(item.productId)!
        existing.totalQuantity += item.soluong
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
      case "chờ xác nhận":
      case "chờ xử lý":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "đang xử lý":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "đang giao":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "giao thành công":
      case "đã nhận hàng":
        return "bg-green-100 text-green-800 border-green-200"
      case "đã huỷ":
        return "bg-red-100 text-red-800 border-red-200"
      case "trả hàng/hoàn tiền":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "chưa thanh toán":
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

  const isOrderCompleted = (status: string) => {
    const completedStatuses = ["giao thành công", "đã nhận hàng"]
    return completedStatuses.some((s) => status.toLowerCase().includes(s.toLowerCase()))
  }

  const openReviewModal = (order: Order) => {
    const uniqueProds = getUniqueProducts(order)
    setUniqueProducts(uniqueProds)
    setSelectedOrder(order)
    setCurrentProductIndex(0)
    setComments({})
    setRatings({})
    setShowReviewModal(true)
  }

  const handleCommentChange = (productId: string, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [productId]: comment,
    }))
  }

  const handleRatingChange = (productId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [productId]: rating,
    }))
  }

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
        isReview: true,
        rating: rating,
        orderId: selectedOrder?._id,
      })
      message.success(`Đánh giá sản phẩm "${productName}" thành công!`)
      if (selectedOrder) {
        const newReviewedOrders = new Set([...reviewedOrders, selectedOrder._id])
        setReviewedOrders(newReviewedOrders)
        localStorage.setItem("reviewedOrders", JSON.stringify([...newReviewedOrders]))
      }
      if (currentProductIndex < uniqueProducts.length - 1) {
        setCurrentProductIndex((prev) => prev + 1)
      } else {
        handleCloseReviewModal()
        setShowThankYouReviewModal(true)
      }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error)
      message.error("Gửi đánh giá thất bại!")
    } finally {
      setReviewLoading(false)
    }
  }

  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    setSelectedOrder(null)
    setUniqueProducts([])
    setCurrentProductIndex(0)
    setComments({})
    setRatings({})
  }

  const handleCloseAchievementNotification = () => {
    setShowAchievementNotification(false)
  }

  const handleCloseThankYouReviewModal = () => {
    setShowThankYouReviewModal(false)
  }

  const AchievementNotification = () => {
    const icon = <FaTrophy className="w-20 h-20 text-yellow-500 animate-pop-in" />
    const title = "Thành tích mới!"
    const messageText = "Bạn đã được cộng 1 điểm vào điểm thành tích vì đã xác nhận nhận hàng thành công!"

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] backdrop-blur-sm">
        <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-3xl p-10 shadow-2xl max-w-md w-full mx-4 text-center transform transition-all duration-500 scale-100 opacity-100 animate-fade-in-up border-4 border-yellow-300">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-full p-4 shadow-lg border-4 border-yellow-400">
            {icon}
          </div>
          <div className="mt-10">
            <h3 className="text-3xl font-extrabold text-green-700 mb-3 drop-shadow-sm">{title}</h3>
            <p className="text-xl text-gray-800 mb-8 leading-relaxed">{messageText}</p>
            <button
              onClick={handleCloseAchievementNotification}
              className="relative px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Tuyệt vời!
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-ping-slow">
                🎉
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ThankYouReviewModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] backdrop-blur-sm">
        <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-3xl p-10 shadow-2xl max-w-md w-full mx-4 text-center transform transition-all duration-500 scale-100 opacity-100 animate-fade-in-up border-4 border-blue-300">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-full p-4 shadow-lg border-4 border-blue-400">
            <FaStar className="w-20 h-20 text-blue-500 animate-pop-in" />
          </div>
          <div className="mt-10">
            <h3 className="text-3xl font-extrabold text-green-700 mb-3 drop-shadow-sm">Cảm ơn bạn đã đánh giá!</h3>
            <p className="text-xl text-gray-800 mb-8 leading-relaxed">
              Đánh giá của bạn sẽ giúp chúng tôi hoàn thiện hơn trong tương lai. Cảm ơn bạn!
            </p>
            <button
              onClick={handleCloseThankYouReviewModal}
              className="relative px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (showAchievementNotification) {
      const timer = setTimeout(() => {
        handleCloseAchievementNotification()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [showAchievementNotification])

  useEffect(() => {
    if (showThankYouReviewModal) {
      const timer = setTimeout(() => {
        handleCloseThankYouReviewModal()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [showThankYouReviewModal])

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

  const totalOrders = orders.length
  const totalSpend = orders.reduce((sum, o) => {
    const { originalTotal } = computeOrderTotals(o)
    return sum + (originalTotal || 0)
  }, 0)

  return (
    <>
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 pt-8">
              <div className="flex items-center gap-3 mb-2">
                <FaShoppingBag className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
              </div>
              <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
            </div>
            <div className="flex justify-center overflow-x-auto whitespace-nowrap mb-[20px]">
              <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">Tất cả</Radio.Button>
                {statusOptions.map((status) => (
                  <Radio.Button key={status} value={status}>
                    {status}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const { originalTotal, refundedAmount } = computeOrderTotals(order)
                    const hasReturnRequest = order.returnStatus && order.returnStatus !== "Từ chối"
                    const showReviewButton = order.status === "Trả hàng/Hoàn tiền" && !reviewedOrders.has(order._id)

                    return (
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
                            <p className="font-semibold text-green-600 text-lg">
                              {originalTotal.toLocaleString()} đ
                            </p>
                            {refundedAmount > 0 && (
                              <p className="text-sm text-gray-500">Đã hoàn: {refundedAmount.toLocaleString()} đ</p>
                            )}
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
                          {order.paymentMethod === "VNPAY" && !order.isPaid && (
                            <button
                              onClick={() => handlePayNow(order)}
                              className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              <FaCreditCard className="w-4 h-4" />
                              Thanh toán ngay
                            </button>
                          )}
                          {!hasReturnRequest && order.status === "Giao thành công" && !reviewedOrders.has(order._id) && (
                            <button
                              onClick={() => confirmReceived(order._id)}
                              className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                            >
                              <FaCheck className="w-4 h-4" />
                              Đã nhận hàng
                            </button>
                          )}
                          {hasReturnRequest && order.status !== "Trả hàng/Hoàn tiền" && (
                            <span className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-2 bg-orange-100 text-orange-800 font-medium rounded-lg">
                              Đang chờ duyệt
                            </span>
                          )}
                          {showReviewButton && (
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
                    )
                  })}
                </div>
              </div>

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
                    {filteredOrders.map((order) => {
                      const { originalTotal, refundedAmount } = computeOrderTotals(order)
                      const hasReturnRequest = order.returnStatus && order.returnStatus !== "Từ chối"
                      const showReviewButton = order.status === "Đã nhận hàng" && !reviewedOrders.has(order._id)

                      return (
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
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-semibold text-green-600">{originalTotal.toLocaleString()} đ</span>
                              {refundedAmount > 0 && (
                                <small className="text-sm text-gray-500">Đã hoàn: {refundedAmount.toLocaleString()} đ</small>
                              )}
                            </div>
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
                              {order.paymentMethod === "VNPAY" && !order.isPaid && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePayNow(order)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200"
                                  >
                                    <FaCreditCard className="w-4 h-4" />
                                    Thanh toán ngay
                                  </button>
                                  <span className="text-sm text-red-600 font-medium">
                                    ({Math.floor((timeLeftMap[order._id] || 0) / 60)}:
                                    {((timeLeftMap[order._id] || 0) % 60)
                                      .toString()
                                      .padStart(2, "0")} phút)
                                  </span>
                                </div>
                              )}
                              {order.status === "Giao thành công" && !hasReturnRequest && !reviewedOrders.has(order._id) && (
                                <button
                                  onClick={() => confirmReceived(order._id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all duration-200"
                                >
                                  <FaCheck className="w-4 h-4" />
                                  Đã nhận hàng
                                </button>
                              )}
                              {hasReturnRequest && order.status !== "Trả hàng/Hoàn tiền" && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-orange-100 text-orange-800">
                                  Đang chờ duyệt
                                </span>
                              )}
                              {showReviewButton && (
                                <button
                                  onClick={() => openReviewModal(order)}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600"
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {orders.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaShoppingBag className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
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
                        {totalSpend.toLocaleString()} đ
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

      {showAchievementNotification && <AchievementNotification />}
      {showThankYouReviewModal && <ThankYouReviewModal />}
    </>
  )
}

export default OrderHistory