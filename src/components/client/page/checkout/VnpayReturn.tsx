// VnpayReturn.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("Đang xử lý kết quả thanh toán...");

  useEffect(() => {
    const confirmVnpay = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vnpay/verify_return${location.search}`);
        const result = await res.json();

        if (result.success) {
          setMessageText(`✅ Thanh toán thành công! Mã đơn: ${result.orderCode}`);
          message.success(`🎉 Thành công: ${result.orderCode}`);
          setTimeout(() => navigate("/"), 3000);
        } else {
          setMessageText("❌ Thanh toán thất bại.");
          message.error(result.message || "Thanh toán thất bại.");
          setTimeout(() => navigate("/checkout"), 3000);
        }
      } catch (err) {
        setMessageText("⚠️ Có lỗi xảy ra khi xác minh thanh toán.");
        message.error("Lỗi khi xác minh.");
        setTimeout(() => navigate("/checkout"), 3000);
      }
    };

    confirmVnpay();
  }, [location.search]);

  return (
    <div className="text-center mt-20 text-xl text-gray-700">
      {messageText}
    </div>
  );
};


export default VnpayReturn;
