
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message, Modal, Spin } from "antd"; // Thêm Spin từ antd
import { useUser } from "../../context/UserContext";
import { ICartItem } from "../../../../interface/cart";
import { IProduct } from "../../../../interface/product";
import axios, { AxiosError } from "axios";
import VoucherInput from "./VoucherInput";
import { applyVoucherToOrder } from "../../../../api/client/promotionApiClient";

interface CartItem {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  soluong: number;
  image: string;
  color?: string;
  storage?: string;
  categoryId?: string;
}
interface IAddress {
  _id: string;
  name: string;
  phone: string;
  address: string;
  district_id: string;
  ward_code: string;
  default?: boolean;
}

interface IUserExtended {
  _id: string;
  name: string;
  email: string;
  sdt?: string;
  address?: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const selectedItems = location.state?.selectedItems as
    | ICartItem[]
    | undefined;
  const buyNowItem = location.state?.buyNowItem as CartItem | undefined;
  const isBuyNow = !!buyNowItem; // Xác định luồng "Mua ngay"

  useEffect(() => {
    const hasCartItems = localStorage.getItem("cartItems");
    const hasPendingOrder = localStorage.getItem("pendingOrder");

    const shouldRedirect =
      !buyNowItem &&
      (!selectedItems || selectedItems.length === 0) &&
      !hasCartItems &&
      !hasPendingOrder &&
      !location.state;

    if (shouldRedirect) {
      message.error("Không có sản phẩm để thanh toán.");
      navigate("/", { replace: true });
    }
  }, [buyNowItem, selectedItems, location.state, navigate]);

  const currentUser = user as IUserExtended | null;

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressList, setAddressList] = useState<IAddress[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingFee, setShippingFee] = useState<number>(35000);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [voucherInfo, setVoucherInfo] = useState<{
    name: string;
    discountValue: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser?._id) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/addresses/${currentUser._id}`
          );
          const addresses = res.data;
          setAddressList(addresses);

          const defaultAddr =
            addresses.find((addr: IAddress) => addr.default === true) ||
            addresses[0];

          if (defaultAddr) {
            setForm((prev) => ({
              ...prev,
              name: defaultAddr.name,
              sdt: defaultAddr.phone,
              address: defaultAddr.address,
              to_district_id: defaultAddr.district_id,
              to_ward_code: defaultAddr.ward_code,
            }));
          }
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
          message.error("Không thể tải danh sách địa chỉ.");
        }
      }
    };
    fetchAddresses();
  }, [currentUser]);

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      try {
        if (buyNowItem) {
          setCart([buyNowItem]);
          return;
        }

        if (selectedItems && selectedItems.length > 0) {
          const productsResponse = await axios.get(
            "http://localhost:5000/api/products"
          );
          const productsData = productsResponse.data;

          const enrichedCartItems = selectedItems.map((item: ICartItem) => {
            const product = productsData.find(
              (p: IProduct) => p._id === item.productId
            );
            let price = item.price || (product ? product.price : 0);

            if (product?.variants && item.color && item.storage) {
              const variant = product.variants.find(
                (v: {
                  color: string;
                  ram: string;
                  price: number;
                  soluong: number;
                }) => v.color === item.color && v.ram === item.storage
              );
              price = variant ? Number(variant.price) : price;
            }

            return {
              _id: item._id,
              productId: item.productId,
              productName: product ? product.name : "Sản phẩm không tồn tại",
              price,
              soluong: item.quantity,
              image: product?.image || "",
              color: item.color || "",
              storage: item.storage || "",
              categoryId: item.categoryId || product?.categoryId || "",
            };
          });

          setCart(enrichedCartItems);
          return;
        }

        if (currentUser?._id) {
          const [cartResponse, productsResponse] = await Promise.all([
            axios.get(`http://localhost:5000/api/carts/${currentUser._id}`),
            axios.get("http://localhost:5000/api/products"),
          ]);

          const cartItems = cartResponse.data.items || [];
          const productsData = productsResponse.data;

          const enrichedCartItems = cartItems.map((item: ICartItem) => {
            const product = productsData.find(
              (p: IProduct) => p._id === item.productId
            );
            let price = item.price || (product ? product.price : 0);

            if (product?.variants && item.color && item.storage) {
              const variant = product.variants.find(
                (v: {
                  color: string;
                  ram: string;
                  price: number;
                  soluong: number;
                }) => v.color === item.color && v.ram === item.storage
              );
              price = variant ? Number(variant.price) : price;
            }

            return {
              _id: item._id,
              productId: item.productId,
              productName: product ? product.name : "Sản phẩm không tồn tại",
              price,
              soluong: item.quantity,
              image: product?.image || "",
              color: item.color || "",
              storage: item.storage || "",
              categoryId: item.categoryId || product?.categoryId || "",
            };
          });

          setCart(enrichedCartItems);
        }
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng từ server:", error);
        message.error("Không thể tải giỏ hàng.");
      }
    };

    fetchCartAndProducts();
  }, [currentUser, buyNowItem, selectedItems]);

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.soluong,
    0
  );
  const totalWithDiscountAndShipping =
    (discountAmount > 0 ? finalPrice : totalPrice) + shippingFee;

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    sdt: currentUser?.sdt || "",
    address: currentUser?.address || "",
    email: currentUser?.email || "",
    note: "",
    paymentMethod: "COD",
    shippingProvider: "GHN",
    to_district_id: "",
    to_ward_code: "",
  });

  useEffect(() => {
    const { to_district_id, to_ward_code, shippingProvider } = form;

    if (!to_district_id || !to_ward_code) return;

    const weight = cart.reduce((sum, i) => sum + i.soluong * 300, 0);

    if (shippingProvider === "GHN") {
      console.log("✅ Chọn địa chỉ:", to_district_id, to_ward_code);
      axios
        .post("http://localhost:5000/api/ghn/calculate-fee", {
          to_district_id: Number(to_district_id),
          to_ward_code: String(to_ward_code),
          weight,
          insurance_value: 0,
        })
        .then((res) => {
          setShippingFee(res.data.shippingFee);
        })
        .catch((err) => {
          console.error("❌ Lỗi tính phí GHN:", err);
          setShippingFee(35000);
        });
    } else {
      setShippingFee(35000);
    }
  }, [form.to_district_id, form.to_ward_code, form.shippingProvider, cart]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyVoucher = async (code: string) => {
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.productId,
        categoryId: String(item.categoryId),
        quantity: item.soluong,
        price: item.price,
      }));

      const response = await applyVoucherToOrder({
        code,
        total: totalPrice,
        userId: currentUser?._id || "",
        items: itemsPayload,
      });

      const { discountAmount, finalPrice, voucherCode, voucherInfo } =
        response.data;
      message.success("Áp dụng mã thành công");
      setDiscountAmount(discountAmount);
      setVoucherCode(voucherCode);
      setFinalPrice(finalPrice);
      setVoucherInfo(voucherInfo);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "Không áp dụng được mã khuyến mãi";
      message.error(errorMsg);
      setDiscountAmount(0);
    }
  };

  const handleOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!user) {
      message.error("Vui lòng đăng nhập để đặt hàng");
      navigate("/login");
      setIsSubmitting(false);
      return;
    }

    if (!form.sdt || !form.address) {
      message.error(
        "Vui lòng cập nhật số điện thoại và địa chỉ trước khi đặt hàng."
      );
      setTimeout(() => navigate("/accounts"), 1000);
      setIsSubmitting(false);
      return;
    }

    if (!form.name || !form.email) {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      message.error("Email không hợp lệ");
      setIsSubmitting(false);
      return;
    }

    const orderCode = `ORD-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    const newOrder = {
      orderCode,
      customerName: form.name,
      phone: form.sdt,
      address: form.address,
      email: form.email,
      notes: form.note,
      paymentMethod: form.paymentMethod,
      shippingProvider: form.shippingProvider,
      total:
        Number(discountAmount > 0 ? finalPrice : totalPrice) +
        Number(shippingFee),
      shippingFee: shippingFee,
      status: "Chờ xác nhận",
      date: new Date().toISOString(),
      isPaid: false,
      refunded: false,
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName.trim(),
        soluong: Number(item.soluong),
        price: Number(item.price),
        color: item.color?.trim() || "",
        storage: item.storage?.trim() || "",
        categoryId: item?.categoryId || "",
      })),
      voucherCode: voucherCode || null,
      discountAmount: discountAmount || 0,
      userId: user._id,
      isBuyNow,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        navigate("/login");
        setIsSubmitting(false);
        return;
      }

      if (form.paymentMethod === "Momo") {
        localStorage.setItem("fromBuyNow", JSON.stringify(isBuyNow));
        localStorage.setItem("pendingOrder", JSON.stringify(newOrder));
        navigate(`/momo_return`, { state: { fromBuyNow: isBuyNow }, replace: true });
        setIsSubmitting(false);
        return;
      }

      const orderResponse = await axios.post(
        "http://localhost:5000/api/orders",
        newOrder,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { order: createdOrder, updatedCart } = orderResponse.data;
      const orderId = createdOrder._id;

      if (form.paymentMethod === "VNPAY") {
        localStorage.setItem("fromBuyNow", JSON.stringify(isBuyNow));
        const vnpRes = await axios.post(
          "http://localhost:5000/api/vnpay/create_payment_url",
          {
            amount: newOrder.total,
            orderCode: newOrder.orderCode,
            orderId,
          }
        );
        const { paymentUrl } = vnpRes.data;
        window.location.href = paymentUrl;
        return;
      }

      if (form.paymentMethod === "COD") {
        for (const item of cart) {
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
      }

      // Đồng bộ giỏ hàng từ backend
      if (updatedCart) {
        localStorage.setItem("cartItems", JSON.stringify(updatedCart.items || []));
        console.log("✅ Đã đồng bộ giỏ hàng từ backend (Checkout):", updatedCart.items);
      } else {
        const cartResponse = await axios.get(
          `http://localhost:5000/api/carts/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        localStorage.setItem("cartItems", JSON.stringify(cartResponse.data.items || []));
        console.log("✅ Đã đồng bộ giỏ hàng từ backend (GET):", cartResponse.data.items);
      }

      setCart([]);
      message.success("Đặt hàng thành công!");
      navigate(
        `/cod_return?orderId=${orderId}&orderCode=${createdOrder.orderCode}`,
        { state: { fromBuyNow: isBuyNow } }
      );
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Lỗi khi đặt hàng:", error);
      message.error(
        error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        Vui lòng{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          đăng nhập
        </a>{" "}
        để tiếp tục.
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
    <Spin spinning={isSubmitting} tip="Đang xử lý đơn hàng..." size="large">
      <div className="mx-4 p-8 bg-white rounded-lg mt-12 mb-12 border-2">
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
                disabled={isSubmitting}
              />
              {form.address && form.sdt ? (
                <div className="bg-gray-100 p-3 rounded mb-3">
                  <p>
                    <strong>{form.name}</strong> – {form.sdt}
                  </p>
                  <p>{form.address}</p>
                  <button
                    type="button"
                    className="text-blue-600 underline mt-2"
                    onClick={() => setShowAddressModal(true)}
                    disabled={isSubmitting}
                  >
                    Đổi địa chỉ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => setShowAddressModal(true)}
                  disabled={isSubmitting}
                >
                  Chọn địa chỉ giao hàng
                </button>
              )}

              <Modal
                open={showAddressModal}
                title="Chọn địa chỉ giao hàng"
                onCancel={() => setShowAddressModal(false)}
                footer={null}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Địa chỉ đã lưu</h3>
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => navigate("/accounts/my-addresses")}
                    disabled={isSubmitting}
                  >
                    Thêm địa chỉ
                  </button>
                </div>
                <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                  {addressList.map((addr) => (
                    <li
                      key={addr._id}
                      className="border p-3 rounded-lg flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold">
                          {addr.name} - {addr.phone}
                        </p>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                      </div>
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          console.log("✅ Chọn địa chỉ:", addr);
                          setForm((prev) => ({
                            ...prev,
                            name: addr.name,
                            sdt: addr.phone,
                            address: addr.address,
                            to_district_id: addr.district_id,
                            to_ward_code: addr.ward_code,
                          }));
                          setShowAddressModal(false);
                        }}
                        disabled={isSubmitting}
                      >
                        Chọn
                      </button>
                    </li>
                  ))}
                </ul>
              </Modal>

              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                disabled={isSubmitting}
              />
              <textarea
                name="note"
                placeholder="Ghi chú đơn hàng (tuỳ chọn)"
                value={form.note}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none"
                disabled={isSubmitting}
              ></textarea>
              <select
                name="shippingProvider"
                value={form.shippingProvider}
                onChange={handleChange}
                className="border p-2 rounded"
                disabled={isSubmitting}
              >
                <option value="Giao hàng tiêu chuẩn">Giao hàng tiêu chuẩn</option>
                <option value="GHN">Giao hàng nhanh</option>
                <option value="J&T">J&T Express</option>
              </select>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Phương thức thanh toán
              </h3>
              <div className="flex flex-col space-y-3">
                {["COD", "Momo", "VNPAY"].map((method) => (
                  <label key={method} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={form.paymentMethod === method}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 text-green-600"
                      disabled={isSubmitting}
                    />
                    <span className="ml-3 capitalize text-gray-700">
                      {method === "COD"
                        ? "Thanh toán khi nhận hàng (COD)"
                        : method === "Momo"
                        ? "Thanh toán qua Momo"
                        : "Thanh toán VNPay"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={isSubmitting}
              className={`mt-10 w-full bg-green-600 text-white font-semibold py-3 rounded-lg transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
              Sản phẩm trong giỏ hàng
            </h2>
            <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
              {cart.map((item) => (
                <li
                  key={`${item.productId}-${item.color || ""}-${item.storage || ""}`}
                  className="flex items-center py-4"
                >
                  <img
                    src={item.image || "/placeholder-image.png"}
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
                <span>Tạm tính:</span>
                <span>{totalPrice.toLocaleString("vi-VN")} VND</span>
              </div>

              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600 text-lg font-medium">
                    <span>Khuyến mãi:</span>
                    <span>-{discountAmount.toLocaleString("vi-VN")} VND</span>
                  </div>
                  <div className="text-sm text-green-700 italic">
                    Mã giảm giá: <strong>{voucherCode}</strong>{" "}
                    {voucherInfo?.name && `– ${voucherInfo.name}`}
                  </div>
                </>
              )}

              <div className="flex justify-between text-gray-600 text-lg">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Tổng cộng:</span>
                <span>
                  {totalWithDiscountAndShipping.toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg text-blue-900 text-sm">
              {form.paymentMethod === "COD" && "Bạn sẽ thanh toán khi nhận hàng."}
              {form.paymentMethod === "Momo" &&
                "Bạn sẽ chuyển đến trang thanh toán MoMo"}
              {form.paymentMethod === "VNPAY" &&
                "Bạn sẽ chuyển đến trang thanh toán VNPAY"}
            </div>
            <VoucherInput onApply={handleApplyVoucher} />
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default Checkout;
