import { Check, CheckCircle, Clock, Package, ShoppingBag, Truck, XCircle } from "lucide-react";

// Lựa chọn màu sắc cho trạng thái đơn hàng
export const getStatusColor = (status: string) => {
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

// Lựa chọn biểu tượng cho trạng thái đơn hàng
export const getStatusIcon = (status: string) => {
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

// Lựa chọn màu sắc cho trạng thái thanh toán
export const getPaymentStatusColor = (status: string) => {
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