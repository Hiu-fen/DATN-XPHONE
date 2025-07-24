import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { CheckCircle, ArrowRight } from "lucide-react";
import axios from "axios";
import { useState } from "react";

const MomoReturn = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFakePayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Bạn cần đăng nhập để thanh toán.");
        navigate("/login");
        return;
      }

      const pendingOrderRaw = localStorage.getItem("pendingOrder");
      if (!pendingOrderRaw) {
        message.error("Không tìm thấy đơn hàng cần xác nhận.");
        return;
      }

      const pendingOrder = JSON.parse(pendingOrderRaw);

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        pendingOrder,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdOrder = response.data;
      const orderId = createdOrder._id;

      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/mark-paid`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("pendingOrder");
      for (const item of pendingOrder.items) {
        await axios.patch(
          `http://localhost:5000/api/products/${item.productId}/update-quantity`,
          {
            color: item.color,
            ram: item.storage,
            soluong: -Number(item.soluong),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (!pendingOrder.buyNowItem) {
        await axios.delete(
          `http://localhost:5000/api/carts/${pendingOrder.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        localStorage.removeItem("cartItems");
      }

      localStorage.removeItem("pendingOrder");
      message.success("Thanh toán thành công!");
      if (createdOrder?.orderCode) {
        window.location.replace(`/thank-you?orderCode=${createdOrder.orderCode}`);
      } else {
        console.error(
          "Không có orderCode trong createdOrder:",
          createdOrder
        );
        message.error("Không thể điều hướng. Đơn hàng không có mã đơn.");
      }
    } catch (err: any) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Thanh toán bằng MoMo
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Hướng dẫn thanh toán:
                </h2>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                <div className="space-y-5">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Mở ứng dụng MoMo
                      </p>
                      <p className="text-sm text-gray-600">
                        Khởi động ứng dụng MoMo trên điện thoại của bạn
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Quét mã QR
                      </p>
                      <p className="text-sm text-gray-600">
                        Sử dụng tính năng quét QR để quét mã bên cạnh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Xác nhận thanh toán
                      </p>
                      <p className="text-sm text-gray-600">
                        Hoàn tất giao dịch và nhận thông báo thành công
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Confirmation Card */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-100 mb-2 text-lg">
                    Đã hoàn tất thanh toán?
                  </p>
                  <p className="font-semibold text-xl mb-4">
                    Nhấn nút bên dưới để xác nhận và tiếp tục
                  </p>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                onClick={handleFakePayment}
                loading={isProcessing}
                className="w-full h-14 bg-white text-purple-600 border-none font-bold text-lg rounded-xl hover:bg-purple-50 hover:text-purple-700 shadow-lg"
                icon={!isProcessing && <CheckCircle className="w-5 h-5" />}
              >
                {isProcessing ? (
                  "Đang xử lý thanh toán..."
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Tôi đã thanh toán</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Right QR Code */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Quét mã QR
                </h3>
              </div>

              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-dashed border-purple-200">
                  <img
                    src="/src/assets/momo1.jpg"
                    alt="QR Code MoMo"
                    className="w-full h-auto max-w-[320px] mx-auto rounded-2xl shadow-xl"
                  />
                </div>

                {/* Decorative scanning corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-purple-500 rounded-tl-xl"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-purple-500 rounded-tr-xl"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-purple-500 rounded-bl-xl"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-purple-500 rounded-br-xl"></div>

                {/* Scanning animation */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8">
            <p className="text-gray-500">
              Cần hỗ trợ? Liên hệ{" "}
              <a
                href="Hoàng Thế Anh"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Hotline: 0866423127 - Hoàng Thế Anh
              </a>
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>Thanh toán an toàn & bảo mật(Bốc Phét)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomoReturn;
