
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Spin, message } from "antd";
import Confetti from "react-confetti";
import {
  LoadingOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

const VnpayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
useEffect(() => {
  const confirmVnpay = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/vnpay/verify_return${location.search}`);
      if (!res.ok) {
        throw new Error(`Lỗi API: ${res.status} - ${res.statusText}`);
      }
      const result = await res.json();

      if (result.success && result.orderCode && result.orderId) {
        setOrderCode(result.orderCode);
        setOrderId(result.orderId);
        setStatus("success");
        setShowConfetti(true);

        // Đồng bộ giỏ hàng từ backend
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?._id && token) {
          try {
            const cartResponse = await fetch(`http://localhost:5000/api/carts/${user._id}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!cartResponse.ok) {
              throw new Error(`Không thể lấy giỏ hàng: ${cartResponse.status}`);
            }
            const cart = await cartResponse.json();
            localStorage.setItem("cartItems", JSON.stringify(cart.items || []));
            console.log("Đã đồng bộ giỏ hàng từ backend:", cart.items);
          } catch (cartError) {
            console.warn("⚠️ Lỗi khi đồng bộ giỏ hàng:", cartError);
            message.warning("Thanh toán thành công, nhưng không thể đồng bộ giỏ hàng. Vui lòng kiểm tra lại.");
          }
        } else {
          console.warn("⚠️ Không tìm thấy userId hoặc token để đồng bộ giỏ hàng");
          message.warning("Không tìm thấy thông tin người dùng để đồng bộ giỏ hàng.");
        }

        // Gọi API cập nhật trạng thái thanh toán
        if (token) {
          try {
            const paidResponse = await fetch(`http://localhost:5000/api/orders/${result.orderId}/paid`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({}),
            });
            if (!paidResponse.ok) {
              throw new Error(`Không thể cập nhật trạng thái thanh toán: ${paidResponse.status}`);
            }
            console.log("Đã cập nhật trạng thái thanh toán");
          } catch (paidError) {
            console.warn("⚠️ Lỗi khi cập nhật trạng thái thanh toán:", paidError);
            message.warning("Thanh toán thành công, nhưng không thể cập nhật trạng thái đơn hàng.");
          }
        }
      } else {
        setStatus("error");
        const errorMessage = result.message || "Thanh toán không thành công. Vui lòng thử lại.";
        message.error(errorMessage);
      }
    } catch (err: unknown) {
      console.error("Lỗi xác minh thanh toán:", err);
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
      message.error(`Xác minh thanh toán thất bại: ${errorMessage}`);
    }
  };

  confirmVnpay();
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
          <h2 className="text-lg font-semibold text-gray-700">Đang xác minh thanh toán...</h2>
          <p className="text-gray-500 text-sm">Vui lòng chờ trong giây lát.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 80 }} />
          <h2 className="text-2xl font-bold text-green-600">🎉 Thanh toán thành công!</h2>
          {orderCode && <p>Mã đơn hàng: <strong>{orderCode}</strong></p>}
          <Button type="primary" onClick={goToDetailOrder}>
            Xem chi tiết đơn hàng
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <CloseCircleTwoTone twoToneColor="#f5222d" style={{ fontSize: 80 }} />
          <h2 className="text-2xl font-bold text-red-500">Thanh toán thất bại</h2>
          <p>Giao dịch không thành công hoặc có lỗi xảy ra.</p>
          <Button type="default" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </>
      )}
    </div>
  );
};

export default VnpayReturn;
