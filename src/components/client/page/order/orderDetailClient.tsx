import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
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
  XCircle,
  Truck,
} from "lucide-react";

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
  customerName: string;
  phone: string;
  address: string;
  cancelReason?: string;
  returnStatus?: string;
  paymentStatus?: string;
  statusHistory?: { status: string; timestamp: string }[];
  returnStatusHistory?: { status: string; timestamp: string }[];
  shippingFee?: number;
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelDisabled, setIsCancelDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "success"
  );

  const cancelReasons = [
    "Sản phẩm không còn nhu cầu",
    "Lỗi thông tin sản phẩm",
    "Nhận được sản phẩm bị lỗi",
    "Đặt nhầm sản phẩm",
    "Khác",
  ];

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "chờ xác nhận":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "đang xử lý":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "đang giao":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "đã giao":
        return "bg-green-50 text-green-700 border-green-200";
      case "đã huỷ":
        return "bg-red-50 text-red-700 border-red-200";
      case "yêu cầu trả hàng":
      case "đang đợi duyệt":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "yêu cầu đã được duyệt":
        return "bg-green-50 text-green-700 border-green-200";
      case "yêu cầu bị từ chối":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-50 text-green-700 border-green-200";
      case "Đã hoàn tiền":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Chưa thanh toán":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "đã đặt hàng":
        return <ShoppingBag className="w-4 h-4" />;
      case "đã xác nhận":
        return <CheckCircle className="w-4 h-4" />;
      case "đang chuẩn bị":
        return <Package className="w-4 h-4" />;
      case "đang giao":
        return <Truck className="w-4 h-4" />;
      case "đã giao":
        return <Check className="w-4 h-4" />;
      case "đã huỷ":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/${id}`
        );
        setOrder(response.data);
        if (response.data.status !== "Chờ xác nhận") {
          setIsCancelDisabled(true);
        }
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
        showToastMessage("Không thể tải thông tin đơn hàng", "error");
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
    showToastMessage("Vui lòng chọn lý do hủy đơn hàng", "warning");
    return;
  }
  if (cancelReason === "Khác") {
    const reason = customReason.trim();
    if (!reason) {
      showToastMessage("Vui lòng nhập lý do hủy đơn hàng!", "warning");
      return;
    }
    if (reason.length < 6) {
      showToastMessage("Lý do hủy đơn hàng phải tối thiểu 6 ký tự!", "warning");
      return;
    }
  }
  try {
    await axios.patch(`http://localhost:5000/api/orders/${id}`, {
      status: "Đã huỷ",
      cancelReason: cancelReason === "Khác" ? customReason : cancelReason,
    });

    showToastMessage("Đơn hàng đã được hủy thành công", "success");
    setOrder((prevOrder) =>
      prevOrder ? { ...prevOrder, status: "Đã huỷ" } : prevOrder
    );
    setIsModalOpen(false);
    setIsCancelDisabled(true);
  } catch (err) {
    console.error("Lỗi khi hủy đơn:", err);
    showToastMessage("Không thể hủy đơn hàng. Vui lòng thử lại", "error");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 mb-6">
            Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600 text-lg">
              Mã đơn hàng: #{order.orderCode}
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200 self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử
          </Link>
        </div>

        {/* Order Status Overview */}
        <div className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Thông tin đơn hàng
              </h2>
            </div>
            <div className="space-y-8">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Trạng thái đơn hàng
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                      order.status
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
                    <span className="text-sm font-medium text-gray-600">
                      Thanh toán
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getPaymentStatusColor(
                      order.paymentStatus || ""
                    )}`}
                  >
                    {order.paymentStatus || "Chưa rõ"}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Phương thức
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {order.paymentMethod || "Chưa rõ"}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Số sản phẩm
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {order.items.length} sản phẩm
                  </p>
                </div>
              </div>

              <hr className="my-8 border-gray-200" />

              {/* Enhanced Recipient Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Thông tin người nhận
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Họ và tên
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {order.customerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Phone className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Số điện thoại
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {order.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Home className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-3">
                        Địa chỉ giao hàng
                      </p>
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-900 leading-relaxed text-lg">
                          {order.address}
                        </p>
                      </div>
                    </div>
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
                      <p className="text-sm font-medium text-yellow-700 mb-1">
                        Trạng thái trả hàng
                      </p>
                      <span
                        className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                          order.returnStatus
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
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết sản phẩm
              </h2>
            </div>
            <div className="space-y-6">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200"
                >
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
                      <h3 className="font-bold text-gray-900 text-xl mb-4">
                        {item.productName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">
                            Màu sắc
                          </span>
                          <p className="font-semibold text-gray-900">
                            {item.snapshot?.color || "Không xác định"}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">
                            Bộ nhớ
                          </span>
                          <p className="font-semibold text-gray-900">
                            {item.snapshot?.storage
                              ? `${item.snapshot.storage} GB`
                              : "Không xác định"}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">
                            Số lượng
                          </span>
                          <p className="font-semibold text-gray-900">
                            {item.soluong}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right bg-white rounded-xl p-6 border border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Đơn giá
                          </div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {item.price.toLocaleString()} đ
                          </div>
                        </div>
                        <hr className="border-gray-200" />
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Thành tiền
                          </div>
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Lịch sử trạng thái đơn hàng
                </h2>
              </div>
              <div className="space-y-4">
                {order.statusHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getStatusIcon(entry.status)}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(
                          entry.status
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Lịch sử trạng thái trả hàng
                </h2>
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
                          entry.status
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
                  {order.returnStatus
                    ? "Đã yêu cầu trả hàng"
                    : "Yêu cầu trả hàng"}
                </Link>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">Phí vận chuyển</p>
                <p className="text-lg text-gray-800 font-semibold mb-2">
                  {order.shippingFee?.toLocaleString() || "0"} đ
                </p>
                <p className="text-sm text-gray-500 mb-2">Tổng thanh toán</p>
                <div className="flex items-center gap-3 text-3xl font-bold text-green-600">
                  <DollarSign className="w-8 h-8" />
                  {order.total.toLocaleString()} đ
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Hủy đơn hàng
                </h3>
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
                            setCancelReason(e.target.value);
                            if (e.target.value !== "Khác") setCustomReason("");
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {reason}
                        </span>
                      </label>
                    ))}
                    {cancelReason === "Khác" && (
                      <div className="mt-4">
                        <textarea
                          value={customReason}
                          onChange={(e) => {
                            if (e.target.value.length <= 200) {
                              setCustomReason(e.target.value);
                            }
                          }}
                          maxLength={200}
                          rows={3}
                          placeholder="Nhập lý do khác..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span className="text-red-400 italic">
                           Lí do phải tối thiểu 6 ký tự và tối đa 200 ký tự
                          </span>
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
      </div>
    </div>
  );
};

export default OrderDetail;
