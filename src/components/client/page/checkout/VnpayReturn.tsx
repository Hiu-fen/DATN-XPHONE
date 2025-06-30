import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");
    const success = location.pathname.includes("success");

    if (code) {
      if (location.search.includes("checkout/success")) {
        message.success(`Thanh toán thành công! Mã đơn: ${code}`);
        navigate("/");
      } else if (location.search.includes("checkout/failure")) {
        message.error(`Thanh toán thất bại! Mã đơn: ${code}`);
        navigate("/checkout");
      } else {
        // fallback: show something
        message.info("Kết quả thanh toán đang được xử lý.");
      }
    }
  }, [location, navigate]);

  return (
    <div className="text-center mt-20 text-xl text-gray-600">
      Đang xử lý kết quả thanh toán...
    </div>
  );
};

export default VnpayReturn;
