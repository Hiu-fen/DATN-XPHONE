import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message, Result, Button } from "antd";
import Confetti from "react-confetti";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const confirmVnpay = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vnpay/verify_return${location.search}`);
        const result = await res.json();

        if (result.success) {
          setStatus("success");
          setOrderCode(result.orderCode);
          message.success(`🎉 Thanh toán thành công! Mã đơn: ${result.orderCode}`);
          setShowConfetti(true);
          setTimeout(() => navigate("/"), 5000);
        } else {
          setStatus("error");
          message.error(result.message || "Thanh toán thất bại.");
          setTimeout(() => navigate("/"), 5000);
        }
      } catch (err) {
        setStatus("error");
        message.error("⚠️ Có lỗi xảy ra khi xác minh thanh toán.");
        setTimeout(() => navigate("/"), 5000);
      }
    };

    confirmVnpay();
  }, [location.search, navigate]);

  return (
    <div className="flex justify-center items-center h-screen relative">
      {showConfetti && <Confetti />}
      {status === "processing" && (
        <Result
          status="info"
          title="Đang xử lý kết quả thanh toán..."
          subTitle="Vui lòng chờ trong giây lát."
        />
      )}
      {status === "success" && (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle={`Mã đơn hàng: ${orderCode}`}
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>,
          ]}
        />
      )}
      {status === "error" && (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle="Có lỗi xảy ra khi xác minh hoặc giao dịch không thành công."
          extra={[
            <Button key="home" onClick={() => navigate("/")}>
              Về trang chủ
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default VnpayReturn;
