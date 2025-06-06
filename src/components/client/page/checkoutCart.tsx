// components/client/page/checkoutCart.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useCart } from "../context/CartContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useUser } from "../context/UserContext";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useUser();

  const SHIPPING_FEE = 35000;

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.soluong,
    0
  );
  const totalWithShipping = totalPrice + SHIPPING_FEE;

  const [form, setForm] = useState({
    name: user?.name || "", // Tự điền nếu đã đăng nhập
    phone: "",
    address: "",
    email: user?.email || "", // Tự điền nếu đã đăng nhập
    note: "",
    paymentMethod: "COD",
    shippingProvider: "Giao hàng tiêu chuẩn",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrder = async () => {
    // Kiểm tra đăng nhập
    if (!user) {
      message.error("Vui lòng đăng nhập để đặt hàng");
      navigate("/login");
      return;
    }

    if (!form.name || !form.phone || !form.address || !form.email) {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      message.error("Email không hợp lệ");
      return;
    }

    const newOrder = {
      orderCode: uuidv4().slice(0, 8).toUpperCase(),
      customerName: form.name,
      phone: form.phone,
      address: form.address,
      email: form.email,
      notes: form.note,
      paymentMethod: form.paymentMethod,
      shippingProvider: form.shippingProvider,
      total: totalWithShipping,
      status: "Chờ xác nhận",
      date: new Date().toISOString(),
      isPaid: false,
      refunded: false,
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        soluong: item.soluong,
        price: item.price,
        snapshot: {
          name: item.productName,
          price: item.price,
          image: item.image,
        },
      })),
      userId: user._id, // Bắt buộc userId từ user đã đăng nhập
    };

    try {
      const token = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!).token
        : null;

      if (!token) {
        message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      await axios.post("http://localhost:5000/api/orders", newOrder, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Trừ kho
      for (const item of cart) {
        await axios.patch(
          `http://localhost:5000/api/products/${item.productId}/update-quantity`,
          { soluong: -item.soluong }
        );
      }

      message.success("Đặt hàng thành công!");
      clearCart();
      navigate("/");
    } catch (err: any) {
      console.error("Lỗi khi đặt hàng:", err);
      message.error(err.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        Giỏ hàng của bạn đang trống.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-12 mb-12">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Xác nhận đơn hàng
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
            Thông tin người nhận
          </h2>
          <div className="space-y-5 mt-6">
            <input
              type="text"
              name="name"
              placeholder="Họ tên *"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Số điện thoại *"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ nhận hàng *"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
            <textarea
              name="note"
              placeholder="Ghi chú đơn hàng (tuỳ chọn)"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none"
            ></textarea>
            <select
              name="shippingProvider"
              value={form.shippingProvider}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="Giao hàng tiêu chuẩn">Giao hàng tiêu chuẩn</option>
              <option value="Giao hàng nhanh">Giao hàng nhanh</option>
              <option value="J&T Express">J&T Express</option>
              <option value="GHN">Giao Hàng Nhanh</option>
            </select>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Phương thức thanh toán</h3>
            <div className="flex flex-col space-y-3">
              {["COD", "Momo", "Bank"].map((method) => (
                <label key={method} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={form.paymentMethod === method}
                    onChange={handleChange}
                    className="form-radio h-5 w-5 text-green-600"
                  />
                  <span className="ml-3 capitalize text-gray-700">
                    {method === "COD"
                      ? "Thanh toán khi nhận hàng (COD)"
                      : method === "Momo"
                      ? "Thanh toán qua Momo"
                      : "Chuyển khoản ngân hàng"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleOrder}
            className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Đặt hàng ngay
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
            Sản phẩm trong giỏ hàng
          </h2>
          <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {cart.map((item) => (
              <li key={item.productId} className="flex items-center py-4">
                <img
                  src={item.image || "https://via.placeholder.com/60"}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg object-cover mr-4 border border-gray-300"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Số lượng: {item.soluong}
                  </p>
                </div>
                <div className="font-semibold text-gray-900">
                  {(item.price * item.soluong).toLocaleString("vi-VN")} VND
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-gray-300 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600 text-lg">
              <span>Tổng tiền:</span>
              <span>{totalPrice.toLocaleString("vi-VN")} VND</span>
            </div>
            <div className="flex justify-between text-gray-600 text-lg">
              <span>Phí vận chuyển:</span>
              <span>{SHIPPING_FEE.toLocaleString("vi-VN")} VND</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Tổng cộng:</span>
              <span>{totalWithShipping.toLocaleString("vi-VN")} VND</span>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg text-blue-900 text-sm">
            {form.paymentMethod === "COD" &&
              "Bạn sẽ thanh toán khi nhận hàng."}
            {form.paymentMethod === "Momo" &&
              "Chuyển khoản đến ví Momo: 0866423127 (Hoang The Anh)"}
            {form.paymentMethod === "Bank" &&
              "Chuyển khoản đến tài khoản ngân hàng: MBBank - 0866423127 - Hoang The Anh)"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;