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
  const [isNotified, setIsNotified] = useState(false); // Thêm biến để tránh gọi thông báo nhiều lần

  useEffect(() => {
    const confirmVnpay = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vnpay/verify_return${location.search}`);
        const result = await res.json();

        if (result.success) {
          setStatus("success");
          setOrderCode(result.orderCode);
          setShowConfetti(true);

          // Kiểm tra nếu chưa thông báo thì gửi thông báo thành công
          if (!isNotified) {
            message.success(`🎉 Thanh toán thành công! Mã đơn: ${result.orderCode}`);
            setIsNotified(true); // Đánh dấu đã thông báo
          }

          try {
            const orderRes = await fetch(`http://localhost:5000/api/orders/by-code/${result.orderCode}`);
            const order = await orderRes.json();
            if (order?._id) {
              await fetch(`http://localhost:5000/api/orders/mark-as-paid/${order._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
              });
              console.log("✅ Đã gọi markAsPaid thành công");
            } else {
              console.warn("⚠️ Không tìm thấy đơn hàng theo orderCode");
            }
          } catch (err) {
            console.error("❌ Lỗi khi gọi markAsPaid:", err);
          }

          // Chuyển trang sau 2 giây
          setTimeout(() => navigate("/"), 2000);
        } else {
          setStatus("error");
          if (!isNotified) {
            message.error(result.message || "Thanh toán thất bại.");
            setIsNotified(true); // Đánh dấu đã thông báo
          }
          setTimeout(() => navigate("/"), 5000);
        }
      } catch (err) {
        setStatus("error");
        if (!isNotified) {
          message.error("⚠️ Có lỗi xảy ra khi xác minh thanh toán.");
          setIsNotified(true); // Đánh dấu đã thông báo
        }
        setTimeout(() => navigate("/"), 5000);
      }
    };

    confirmVnpay();
  }, [location.search, navigate, isNotified]); // Thêm isNotified vào dependency để theo dõi

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
