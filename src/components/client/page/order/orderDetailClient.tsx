import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaBox,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaClipboardList,
  FaHashtag,
  FaTrashAlt,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

interface Item {
  productName: string;
  soluong: number;
  price: number;
  snapshot: {
    image?: string;
    color?: string;
    storage?: string;
  };
}

interface Order {
  orderCode: string;
  total: number;
  status: string;
  date: string;
  items: Item[];
  paymentMethod?: string;
  address: string;
}

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelDisabled, setIsCancelDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');

  const cancelReasons = [
    "Sản phẩm không còn nhu cầu",
    "Lỗi thông tin sản phẩm", 
    "Nhận được sản phẩm bị lỗi",
    "Đặt nhầm sản phẩm",
    "Khác"
  ];

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'chờ xác nhận':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'đang xử lý':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'đang giao':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'đã giao':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'đã huỷ':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(response.data);
        if (response.data.status !== "Chờ xác nhận") {
          setIsCancelDisabled(true);
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
        showToastMessage('Không thể tải thông tin đơn hàng', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      showToastMessage("Vui lòng chọn lý do huỷ đơn hàng", 'warning');
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, {
        status: "Đã huỷ",
        returnReason: cancelReason
      });

      showToastMessage("Đơn hàng đã được huỷ thành công", 'success');
      setOrder(prevOrder => prevOrder ? { ...prevOrder, status: "Đã huỷ" } : prevOrder);
      setIsModalOpen(false);
      setIsCancelDisabled(true);
    } catch (err) {
      console.error("Lỗi khi hủy đơn:", err);
      showToastMessage("Không thể huỷ đơn hàng. Vui lòng thử lại", 'error');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Đang tải dữ liệu đơn hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
              <p className="text-gray-600 mb-6">Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
              <Link
                to="/history"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                Quay lại lịch sử
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 min-h-screen">
      <div className="bg-gray-50 min-h-full">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
              toastType === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              toastType === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              {toastType === 'success' && <FaCheck className="w-5 h-5" />}
              {toastType === 'error' && <FaTimes className="w-5 h-5" />}
              {toastType === 'warning' && <FaExclamationTriangle className="w-5 h-5" />}
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Chi tiết đơn hàng
              </h1>
              <p className="text-gray-600">Mã đơn hàng: #{order.orderCode}</p>
            </div>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              Quay lại lịch sử
            </Link>
          </div>

          {/* Order Info Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaClipboardList className="w-5 h-5 text-blue-600" />
              Thông tin đơn hàng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <FaHashtag className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="font-semibold text-gray-900">#{order.orderCode}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaCalendarAlt className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ngày đặt</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.date).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaBox className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaCreditCard className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Thanh toán</p>
                  <p className="font-semibold text-gray-900">{order.paymentMethod || 'Chưa rõ'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Địa chỉ giao hàng</p>
                  <p className="font-semibold text-gray-900">{order.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaBox className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Số sản phẩm</p>
                  <p className="font-semibold text-gray-900">{order.items.length} sản phẩm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FaBox className="w-5 h-5 text-blue-600" />
                Chi tiết sản phẩm
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.snapshot?.image ? (
                        <img
                          src={item.snapshot.image || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <FaBox className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.productName}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Màu sắc:</span> {item.snapshot?.color || 'Không xác định'}
                        </div>
                        <div>
                          <span className="font-medium">Bộ nhớ:</span> {item.snapshot?.storage || 'Không xác định'}
                        </div>
                        <div>
                          <span className="font-medium">Số lượng:</span> {item.soluong}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm text-gray-500 mb-1">Đơn giá</div>
                      <div className="font-medium text-gray-900">{item.price.toLocaleString()} đ</div>
                      <div className="text-sm text-gray-500 mt-1">Thành tiền</div>
                      <div className="text-lg font-semibold text-green-600">
                        {(item.price * item.soluong).toLocaleString()} đ
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions and Total */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isCancelDisabled}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isCancelDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              }`}
            >
              <FaTrashAlt className="w-4 h-4" />
              {isCancelDisabled ? 'Không thể hủy' : 'Hủy đơn hàng'}
            </button>

            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Tổng thanh toán</p>
              <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
                <FaMoneyBillWave className="w-6 h-6" />
                {order.total.toLocaleString()} đ
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Hủy đơn hàng</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vui lòng chọn lý do hủy đơn hàng:
                  </label>
                  <div className="space-y-3">
                    {cancelReasons.map((reason, idx) => (
                      <label key={idx} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{reason}</span>
                      </label>
                    ))}
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
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Xác nhận hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;