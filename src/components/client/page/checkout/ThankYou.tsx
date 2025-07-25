import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Truck, Clock, Receipt } from "lucide-react";
import { useEffect, useState } from "react";

const ThankYou = () => {
  const [params] = useSearchParams();
  const orderCode = params.get("orderCode");
  const orderId = params.get("orderId");

  const goToDetail = () => {
    if (orderId) {
      nav(`/history/${orderId}`);
    } else {
      nav("/");
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    setShowConfetti(true);
    const timer1 = setTimeout(() => setShowConfetti(false), 3000);

    // Ghi đè history hiện tại → chặn back về checkout/detail
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Khi bấm back → luôn quay về trang chủ
      nav("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimeout(timer1);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [nav]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: [
                    "#10B981",
                    "#3B82F6",
                    "#8B5CF6",
                    "#F59E0B",
                    "#EF4444",
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background Decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>

      <div className="container mx-auto px-4 py-12 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Main Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-gray-100">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                🎉 Đặt hàng thành công!
              </h1>

              <p className="text-xl text-gray-600 mb-2 leading-relaxed">
                Cảm ơn bạn đã tin tưởng và mua hàng tại cửa hàng của chúng tôi
              </p>

              <p className="text-lg text-gray-500">
                Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn
              </p>
            </div>

            {/* Order Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 border border-green-100">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Receipt className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Thông tin đơn hàng
                </h3>
              </div>

              <div className="text-center">
                <p className="text-sm text-green-600 font-semibold mb-2 uppercase tracking-wide">
                  Mã đơn hàng
                </p>
                <p className="text-3xl font-bold text-green-700 font-mono tracking-wider bg-white px-6 py-3 rounded-xl inline-block shadow-sm">
                  {orderCode}
                </p>
                {orderId && (
                  <div className="text-center mt-6">
                    <button
                      onClick={goToDetail}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition"
                    >
                      Xem chi tiết đơn hàng
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Trạng thái đơn hàng
              </h3>

              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                {/* Step 1 - Completed */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-green-600 mb-1">
                    Đã đặt hàng
                  </h4>
                  <p className="text-sm text-gray-500">
                    Đơn hàng đã được xác nhận
                  </p>
                </div>

                <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-green-500 to-yellow-400 rounded-full"></div>

                {/* Step 2 - In Progress */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-3 shadow-lg animate-pulse">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-yellow-600 mb-1">
                    Đang chuẩn bị
                  </h4>
                  <p className="text-sm text-gray-500">
                    Đang đóng gói sản phẩm
                  </p>
                </div>

                <div className="hidden md:block flex-1 h-1 bg-gray-200 rounded-full"></div>

                {/* Step 3 - Pending */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-500 mb-1">
                    Đang giao hàng
                  </h4>
                  <p className="text-sm text-gray-500">
                    Sẽ được giao trong 1-2 ngày
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Thời gian giao hàng dự kiến
                </h3>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  1 - 2 ngày làm việc
                </p>
                <p className="text-gray-600">
                  Chúng tôi sẽ gửi thông báo khi đơn hàng được giao
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
