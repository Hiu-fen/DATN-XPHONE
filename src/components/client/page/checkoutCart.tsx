import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useUser } from "../context/UserContext";
import axios from "axios";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  soluong: number;
  image: string;
  color?: string;
  storage?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);

  const SHIPPING_FEE = 35000;

  // Lấy giỏ hàng và sản phẩm từ server
  useEffect(() => {
    if (user?._id) {
      const fetchCartAndProducts = async () => {
        try {
          const [cartResponse, productsResponse] = await Promise.all([
            axios.get(`http://localhost:5000/api/carts/${user._id}`),
            axios.get("http://localhost:5000/api/products"),
          ]);

          const cartItems = cartResponse.data.items || [];
          const productsData = productsResponse.data;

          console.log("Cart items from server:", cartItems); // Debug dữ liệu giỏ hàng

          const enrichedCartItems = cartItems.map((item: any) => {
            const product = productsData.find(
              (p: any) => p._id === item.productId
            );
            let price = item.price || (product ? product.price : 0);

            // Lấy giá từ biến thể nếu có
            if (product?.variants && item.color && item.storage) {
              const variant = product.variants.find(
                (v: any) => v.color === item.color && v.ram === item.storage
              );
              price = variant ? Number(variant.price) : price;
            }

            return {
              productId: item.productId,
              productName: product ? product.name : "Sản phẩm không tồn tại",
              price,
              soluong: item.quantity,
              image: product?.image,
              color: item.color || "",
              storage: item.storage || "",
            };
          });

          setCart(enrichedCartItems);
        } catch (error) {
          console.error("Lỗi khi lấy giỏ hàng từ server:", error);
          message.error("Không thể tải giỏ hàng.");
        }
      };
      fetchCartAndProducts();
    }
  }, [user]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.soluong,
    0
  );
  const totalWithShipping = totalPrice + SHIPPING_FEE;

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    email: user?.email || "",
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

    const orderCode = `ORD-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;
    const newOrder = {
      orderCode,
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
        color: item.color || "",
        storage: item.storage || "",
      })),
      userId: user._id,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        navigate("/login");
        return;
      }

      console.log("Order data to send:", newOrder); // Debug dữ liệu gửi

      // Lưu đơn hàng lên server
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        newOrder,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Order response from server:", response.data); // Debug phản hồi

      // Thông báo theo phương thức thanh toán
      if (form.paymentMethod === "Momo") {
        message.info(
          "Vui lòng chuyển khoản qua Momo: 0866423127 (Hoang The Anh)"
        );
      } else if (form.paymentMethod === "Bank") {
        message.info(
          "Vui lòng chuyển khoản qua MBBank: 0866423127 (Hoang The Anh)"
        );
      } else if (form.paymentMethod === "COD") {
        message.info("Bạn sẽ thanh toán khi nhận hàng.");
      }

     
      for (const item of cart) {
        await axios.patch(
          `http://localhost:5000/api/products/${item.productId}/update-quantity`,
          { soluong: -item.soluong },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Xóa giỏ hàng trên server
      await axios.delete(`http://localhost:5000/api/carts/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Xóa localStorage (nếu có dữ liệu giỏ hàng cũ)
      localStorage.removeItem("cartItems");

      message.success("Đặt hàng thành công!");
      setCart([]);
      navigate("/");
    } catch (err: any) {
      console.error("Lỗi khi đặt hàng:", err);
      message.error(
        err.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại."
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        Vui lòng{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          đăng nhập
        </a>{" "}
        để thanh toán.
      </div>
    );
  }

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
              <option value="Giao hàng tiêu chuẩn">Giao Hàng Tiêu Chuẩn</option>
              <option value="J&T Express">J&T Express</option>
              <option value="GHN">Giao Hàng Nhanh</option>
            </select>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">
              Phương thức thanh toán
            </h3>
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
              <li
                key={`${item.productId}-${item.color || ""}-${
                  item.storage || ""
                }`}
                className="flex items-center py-4"
              >
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg object-cover mr-4 border border-gray-300"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Số lượng: {item.soluong}
                  </p>
                  {item.color && (
                    <p className="text-sm text-gray-500">Màu: {item.color}</p>
                  )}
                  {item.storage && (
                    <p className="text-sm text-gray-500">
                      Dung lượng: {item.storage}
                    </p>
                  )}
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
            {form.paymentMethod === "COD" && "Bạn sẽ thanh toán khi nhận hàng."}
            {form.paymentMethod === "Momo" &&
              "Vui lòng chuyển khoản qua Momo: 0866423127 (Hoang The Anh)"}
            {form.paymentMethod === "Bank" &&
              "Vui lòng chuyển khoản qua MBBank: 0866423127 (Hoang The Anh)"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
