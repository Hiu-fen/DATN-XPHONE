import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Spin, message } from "antd";
import Confetti from "react-confetti";
import {
  LoadingOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

const CodReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderIdFromUrl = searchParams.get("orderId");
    const orderCodeFromUrl = searchParams.get("orderCode");

    if (orderIdFromUrl && orderCodeFromUrl) {
      setOrderId(orderIdFromUrl);
      setOrderCode(orderCodeFromUrl);
      setStatus("success");
      setShowConfetti(true);

      // Đồng bộ giỏ hàng từ backend
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?._id && token) {
        fetch(`http://localhost:5000/api/carts/${user._id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((cart) => {
            localStorage.setItem("cartItems", JSON.stringify(cart.items || []));
            console.log("✅ Đã đồng bộ giỏ hàng từ backend:", cart.items);
          })
          .catch((err) => {
            console.warn("❌ Lỗi khi lấy giỏ hàng từ backend:", err);
            message.error("Không thể đồng bộ giỏ hàng. Vui lòng kiểm tra lại.");
          });
      }
    } else {
      setStatus("error");
    }
  }, [location.search]);

  const goToDetailOrder = () => {
    if (orderId) {
      navigate(`/history/${orderId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center relative bg-white gap-4">
      {showConfetti && <Confetti />}

      {status === "processing" && (
        <>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 60, color: "#1890ff" }} spin />} />
          <h2 className="text-lg font-semibold text-gray-700">Đang xử lý đơn hàng...</h2>
          <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 80 }} />
          <h2 className="text-2xl font-bold text-green-600">🎉 Đặt hàng thành công!</h2>
          {orderCode && <p>Mã đơn hàng: <strong>{orderCode}</strong></p>}
          <Button type="primary" onClick={goToDetailOrder}>
            Xem chi tiết đơn hàng
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <CloseCircleTwoTone twoToneColor="#f5222d" style={{ fontSize: 80 }} />
          <h2 className="text-2xl font-bold text-red-500">Lỗi khi đặt hàng</h2>
          <p>Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.</p>
          <Button type="default" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </>
      )}
    </div>
  );
};

export default CodReturn;