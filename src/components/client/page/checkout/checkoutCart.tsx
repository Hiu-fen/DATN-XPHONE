import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message, Modal, Spin, Checkbox } from "antd";
import { useUser } from "../../context/UserContext";
import type { ICartItem } from "../../../../interface/cart";
import type { IProduct } from "../../../../interface/product";
import axios, { type AxiosError } from "axios";
import VoucherInput from "./VoucherInput";
import { applyVoucherToOrder } from "../../../../api/client/promotionApiClient";
import { useQuery } from "@tanstack/react-query";

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

// Interface cho thông tin người đặt hàng
interface OrdererInfo {
  name: string;
  phone: string;
  email: string;
}

// Interface cho thông tin người nhận hàng
interface RecipientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  to_district_id: string;
  to_ward_code: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const selectedItems = location.state?.selectedItems as
    | ICartItem[]
    | undefined;
  const buyNowItem = location.state?.buyNowItem as CartItem | undefined;
  const isBuyNow = !!buyNowItem;

  const {
    data: completedOrderCount = 0,
    isLoading: isLoadingOrders,
    error: orderError,
  } = useQuery({
    queryKey: ["completed-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) return 0;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/user/${user._id}?status=Hoàn thành`,
          {
            withCredentials: true,
          }
        );
        console.log("Đã lấy số đơn hàng hoàn thành:", res.data.length);
        return res.data.length;
      } catch (error) {
        console.error("Lỗi khi lấy số đơn hàng hoàn thành:", error);
        message.error("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại.");
        return 0;
      }
    },
    enabled: !!user?._id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

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
  const [paymentMethod, setPaymentMethod] = useState("VNPAY"); // Changed default to VNPAY
  const [shippingProvider, setShippingProvider] = useState("GHN");

  // State cho validation errors
  const [errors, setErrors] = useState<{
    orderer?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    recipient?: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  }>({});

  // State cho thông tin người đặt hàng
  const [ordererInfo, setOrdererInfo] = useState<OrdererInfo>({
    name: currentUser?.name || "",
    phone: currentUser?.sdt || "",
    email: currentUser?.email || "",
  });

  // State cho thông tin người nhận hàng
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    name: currentUser?.name || "",
    phone: currentUser?.sdt || "",
    email: currentUser?.email || "",
    address: currentUser?.address || "",
    note: "",
    to_district_id: "",
    to_ward_code: "",
  });

  // State để kiểm tra người nhận có khác người đặt không
  const [isDifferentRecipient, setIsDifferentRecipient] = useState(false);

  // Function validate số điện thoại Việt Nam
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  };

  // Function validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function validate tên
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  // Function validate toàn bộ form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate thông tin người đặt hàng
    if (!ordererInfo.name.trim()) {
      newErrors.orderer = {
        ...newErrors.orderer,
        name: "Vui lòng nhập tên người đặt hàng",
      };
    } else if (!validateName(ordererInfo.name)) {
      newErrors.orderer = {
        ...newErrors.orderer,
        name: "Tên chỉ được chứa chữ cái và khoảng trắng (2-50 ký tự)",
      };
    }

    if (!ordererInfo.phone.trim()) {
      newErrors.orderer = {
        ...newErrors.orderer,
        phone: "Vui lòng nhập số điện thoại người đặt hàng",
      };
    } else if (!validatePhoneNumber(ordererInfo.phone)) {
      newErrors.orderer = {
        ...newErrors.orderer,
        phone: "Số điện thoại không hợp lệ (VD: 0901234567)",
      };
    }

    if (!ordererInfo.email.trim()) {
      newErrors.orderer = {
        ...newErrors.orderer,
        email: "Vui lòng nhập email người đặt hàng",
      };
    } else if (!validateEmail(ordererInfo.email)) {
      newErrors.orderer = { ...newErrors.orderer, email: "Email không hợp lệ" };
    }

    if (isDifferentRecipient) {
      if (!recipientInfo.name.trim()) {
        newErrors.recipient = {
          ...newErrors.recipient,
          name: "Vui lòng nhập tên người nhận hàng",
        };
      } else if (!validateName(recipientInfo.name)) {
        newErrors.recipient = {
          ...newErrors.recipient,
          name: "Tên chỉ được chứa chữ cái và khoảng trắng (2-50 ký tự)",
        };
      }

      if (!recipientInfo.phone.trim()) {
        newErrors.recipient = {
          ...newErrors.recipient,
          phone: "Vui lòng nhập số điện thoại người nhận hàng",
        };
      } else if (!validatePhoneNumber(recipientInfo.phone)) {
        newErrors.recipient = {
          ...newErrors.recipient,
          phone: "Số điện thoại không hợp lệ (VD: 0901234567)",
        };
      }

      if (recipientInfo.email && !validateEmail(recipientInfo.email)) {
        newErrors.recipient = {
          ...newErrors.recipient,
          email: "Email người nhận không hợp lệ",
        };
      }

      if (!recipientInfo.address.trim()) {
        newErrors.recipient = {
          ...newErrors.recipient,
          address: "Vui lòng chọn địa chỉ giao hàng",
        };
      } else if (recipientInfo.address.length < 10) {
        newErrors.recipient = {
          ...newErrors.recipient,
          address: "Địa chỉ quá ngắn, vui lòng nhập đầy đủ",
        };
      }
    } else {
      if (!recipientInfo.address.trim()) {
        newErrors.recipient = {
          ...newErrors.recipient,
          address: "Vui lòng chọn địa chỉ giao hàng",
        };
      } else if (recipientInfo.address.length < 10) {
        newErrors.recipient = {
          ...newErrors.recipient,
          address: "Địa chỉ quá ngắn, vui lòng nhập đầy đủ",
        };
      }
    }

    setErrors(newErrors);

    const hasErrors = Object.keys(newErrors).some(
      (key) =>
        Object.keys(newErrors[key as keyof typeof newErrors] || {}).length > 0
    );

    if (hasErrors) {
      message.error("Vui lòng kiểm tra lại thông tin đã nhập");
      const firstErrorElement = document.querySelector(".error-input");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }

    return !hasErrors;
  };

  // Function xóa lỗi khi người dùng nhập
  const clearError = (section: "orderer" | "recipient", field: string) => {
    setErrors((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: undefined,
      },
    }));
  };

  const getOrderDiscount = (orderCount: number) => {
    if (orderCount > 30) return 50000;
    if (orderCount >= 21) return 40000;
    if (orderCount >= 11) return 30000;
    if (orderCount >= 6) return 20000;
    if (orderCount >= 1) return 10000;
    return 0;
  };

  const orderDiscount = getOrderDiscount(completedOrderCount);
  const showOrderDiscountLine = orderDiscount > 0;

  // Cập nhật thông tin người dùng khi component mount
  useEffect(() => {
    if (currentUser) {
      setOrdererInfo({
        name: currentUser.name || "",
        phone: currentUser.sdt || "",
        email: currentUser.email || "",
      });

      if (!isDifferentRecipient) {
        setRecipientInfo((prev) => ({
          ...prev,
          name: currentUser.name || "",
          phone: currentUser.sdt || "",
          email: currentUser.email || "",
        }));
      }
    }
  }, [currentUser, isDifferentRecipient]);

  // Handle high-value order: reset payment method if COD is selected and total exceeds 50M
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.soluong,
    0
  );
  const totalWithDiscountAndShipping =
    (discountAmount > 0 ? finalPrice : totalPrice - orderDiscount) +
    shippingFee;
  const isHighValueOrder = totalWithDiscountAndShipping > 50000000; // 50 million VND threshold

  useEffect(() => {
    if (isHighValueOrder && paymentMethod === "COD") {
      setPaymentMethod("VNPAY"); // Reset to VNPAY if COD is selected for high-value order
      message.warning(
        "Đơn hàng trên 50 triệu không hỗ trợ thanh toán COD. Vui lòng chọn phương thức khác."
      );
    }
  }, [isHighValueOrder, paymentMethod]);

  const handleDifferentRecipientChange = (checked: boolean) => {
    setIsDifferentRecipient(checked);
    if (!checked) {
      setRecipientInfo((prev) => ({
        ...prev,
        name: ordererInfo.name,
        phone: ordererInfo.phone,
        email: ordererInfo.email,
      }));
      setErrors((prev) => ({
        ...prev,
        recipient: {
          address: prev.recipient?.address,
        },
      }));
    } else {
      setRecipientInfo((prev) => ({
        ...prev,
        name: "",
        phone: "",
        email: "",
      }));
    }
  };

  const handleOrdererInfoChange = (field: keyof OrdererInfo, value: string) => {
    setOrdererInfo((prev) => ({ ...prev, [field]: value }));
    clearError("orderer", field);
    if (!isDifferentRecipient) {
      setRecipientInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleRecipientInfoChange = (
    field: keyof RecipientInfo,
    value: string
  ) => {
    setRecipientInfo((prev) => ({ ...prev, [field]: value }));
    clearError("recipient", field);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser?._id) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/addresses/${currentUser._id}`,
            {
              withCredentials: true,
            }
          );
          const addresses = res.data;
          setAddressList(addresses);
          const defaultAddr =
            addresses.find((addr: IAddress) => addr.default === true) ||
            addresses[0];
          if (defaultAddr) {
            setRecipientInfo((prev) => ({
              ...prev,
              name: defaultAddr.name,
              phone: defaultAddr.phone,
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
            "http://localhost:5000/api/products",
            { withCredentials: true }
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
            axios.get(`http://localhost:5000/api/carts/${currentUser._id}`, {
              withCredentials: true,
            }),
            axios.get("http://localhost:5000/api/products", {
              withCredentials: true,
            }),
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
        total: totalPrice - orderDiscount,
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

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    if (cart.length === 0) {
      message.error("Giỏ hàng trống, vui lòng thêm sản phẩm");
      setIsSubmitting(false);
      return;
    }

    if (totalWithDiscountAndShipping <= 0) {
      message.error("Tổng tiền đơn hàng không hợp lệ");
      setIsSubmitting(false);
      return;
    }

    const orderCode = `ORD-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    const finalRecipientInfo = isDifferentRecipient
      ? {
          name: recipientInfo.name.trim(),
          phone: recipientInfo.phone.trim(),
          email: recipientInfo.email?.trim() || ordererInfo.email.trim(),
          address: recipientInfo.address.trim(),
          note: recipientInfo.note?.trim() || "",
        }
      : {
          name: ordererInfo.name.trim(),
          phone: ordererInfo.phone.trim(),
          email: ordererInfo.email.trim(),
          address: recipientInfo.address.trim(),
          note: recipientInfo.note?.trim() || "",
        };

    const newOrder = {
      orderCode,
      customerName: ordererInfo.name,
      phone: ordererInfo.phone,
      address: recipientInfo.address,
      email: ordererInfo.email,
      notes: recipientInfo.note,
      ordererInfo: {
        name: ordererInfo.name.trim(),
        phone: ordererInfo.phone.trim(),
        email: ordererInfo.email.trim(),
      },
      recipientInfo: finalRecipientInfo,
      paymentMethod: paymentMethod,
      shippingProvider: shippingProvider,
      total: Number(totalWithDiscountAndShipping),
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
      orderDiscount: orderDiscount || 0,
      userId: user._id,
      isBuyNow,
    };

    console.log("🚀 SENDING ORDER DATA:", newOrder);
    console.log("🚀 isDifferentRecipient:", isDifferentRecipient);
    console.log("🚀 ordererInfo:", newOrder.ordererInfo);
    console.log("🚀 recipientInfo:", newOrder.recipientInfo);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        navigate("/login");
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === "Momo") {
        localStorage.setItem("fromBuyNow", JSON.stringify(isBuyNow));
        localStorage.setItem("pendingOrder", JSON.stringify(newOrder));
        navigate(`/momo_return`, {
          state: { fromBuyNow: isBuyNow },
          replace: true,
        });
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

      console.log("ORDER RESPONSE:", orderResponse.data);

      const { order: createdOrder, updatedCart } = orderResponse.data;
      const orderId = createdOrder._id;

      if (paymentMethod === "VNPAY") {
        localStorage.setItem("fromBuyNow", JSON.stringify(isBuyNow));
        try {
          const vnpRes = await axios.post(
            "http://localhost:5000/api/vnpay/create_payment_url",
            {
              amount: newOrder.total,
              orderCode: newOrder.orderCode,
              orderId: createdOrder._id, // Đảm bảo gửi _id
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!vnpRes.data.success) {
            throw new Error(
              vnpRes.data.message || "Không thể tạo URL thanh toán VNPAY"
            );
          }

          const { paymentUrl } = vnpRes.data;
          if (!paymentUrl) {
            throw new Error("Không nhận được URL thanh toán từ VNPAY");
          }
          window.location.href = paymentUrl;
        } catch (vnpError: unknown) {
          const errorMessage =
            vnpError instanceof Error
              ? vnpError.message
              : "Không thể khởi tạo thanh toán VNPAY.";
          console.error("Lỗi khi tạo URL thanh toán VNPAY:", vnpError);
          message.error(errorMessage);
          setIsSubmitting(false);
        }
        return;
      }

      if (paymentMethod === "COD") {
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

      if (updatedCart && paymentMethod !== "VNPAY") {
        localStorage.setItem(
          "cartItems",
          JSON.stringify(updatedCart.items || [])
        );
        console.log(
          "Đã đồng bộ giỏ hàng từ backend (Checkout):",
          updatedCart.items
        );
      } else if (paymentMethod !== "VNPAY") {
        const cartResponse = await axios.get(
          `http://localhost:5000/api/carts/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        localStorage.setItem(
          "cartItems",
          JSON.stringify(cartResponse.data.items || [])
        );
        console.log(
          "Đã đồng bộ giỏ hàng từ backend (GET):",
          cartResponse.data.items
        );
      }

      setCart([]);
      message.success("Đặt hàng thành công!");
      navigate(
        `/cod_return?orderId=${orderId}&orderCode=${createdOrder.orderCode}`,
        {
          state: { fromBuyNow: isBuyNow },
        }
      );
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Lỗi khi đặt hàng:", error);

      if (error.response?.status === 400) {
        message.error(
          error.response.data?.message || "Thông tin đơn hàng không hợp lệ"
        );
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigate("/login");
      } else if (error.response?.status === 409) {
        message.error("Sản phẩm đã hết hàng hoặc không đủ số lượng");
      } else {
        message.error(
          error.response?.data?.message ||
            "Đặt hàng thất bại. Vui lòng thử lại."
        );
      }
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

  return (
    <div className="min-h-screen flex flex-col items-center">
      {isLoadingOrders || cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Spin size="large" tip="Đang tải dữ liệu...">
            <div style={{ minHeight: 100 }} />
          </Spin>
        </div>
      ) : (
        <Spin spinning={isSubmitting} tip="Đang xử lý đơn hàng..." size="large">
          <div className="mx-4 p-8 bg-white rounded-lg mt-12 mb-12 border-2 w-full max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
              Xác nhận đơn hàng
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                {/* Thông tin người đặt hàng */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
                    Thông tin người đặt hàng
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <input
                        type="text"
                        placeholder="Họ tên người đặt hàng *"
                        value={ordererInfo.name}
                        onChange={(e) =>
                          handleOrdererInfoChange("name", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                          errors.orderer?.name
                            ? "border-red-500 bg-red-50 error-input"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.orderer?.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.orderer.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Số điện thoại người đặt hàng *"
                        value={ordererInfo.phone}
                        onChange={(e) =>
                          handleOrdererInfoChange("phone", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                          errors.orderer?.phone
                            ? "border-red-500 bg-red-50 error-input"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.orderer?.phone && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.orderer.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email người đặt hàng *"
                        value={ordererInfo.email}
                        onChange={(e) =>
                          handleOrdererInfoChange("email", e.target.value)
                        }
                        className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                          errors.orderer?.email
                            ? "border-red-500 bg-red-50 error-input"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.orderer?.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.orderer.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <Checkbox
                    checked={isDifferentRecipient}
                    onChange={(e) =>
                      handleDifferentRecipientChange(e.target.checked)
                    }
                    disabled={isSubmitting}
                  >
                    <span className="text-gray-700 font-medium">
                      Người nhận hàng khác với người đặt hàng
                    </span>
                  </Checkbox>
                </div>

                {isDifferentRecipient && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
                      Thông tin người nhận hàng
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <input
                          type="text"
                          placeholder="Họ tên người nhận *"
                          value={recipientInfo.name}
                          onChange={(e) =>
                            handleRecipientInfoChange("name", e.target.value)
                          }
                          className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                            errors.recipient?.name
                              ? "border-red-500 bg-red-50 error-input"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.recipient?.name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.recipient.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="tel"
                          placeholder="Số điện thoại người nhận *"
                          value={recipientInfo.phone}
                          onChange={(e) =>
                            handleRecipientInfoChange("phone", e.target.value)
                          }
                          className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                            errors.recipient?.phone
                              ? "border-red-500 bg-red-50 error-input"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.recipient?.phone && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.recipient.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          type="email"
                          placeholder="Email người nhận (tùy chọn)"
                          value={recipientInfo.email}
                          onChange={(e) =>
                            handleRecipientInfoChange("email", e.target.value)
                          }
                          className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                            errors.recipient?.email
                              ? "border-red-500 bg-red-50 error-input"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          disabled={isSubmitting}
                        />
                        {errors.recipient?.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.recipient.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">
                    Địa chỉ giao hàng
                  </h2>
                  <div className="space-y-5">
                    {recipientInfo.address ? (
                      <div
                        className={`p-4 rounded-lg mb-3 ${
                          errors.recipient?.address
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">
                              <strong>
                                {isDifferentRecipient
                                  ? recipientInfo.name
                                  : ordererInfo.name}
                              </strong>{" "}
                              –{" "}
                              {isDifferentRecipient
                                ? recipientInfo.phone
                                : ordererInfo.phone}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {recipientInfo.address}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                            onClick={() => setShowAddressModal(true)}
                            disabled={isSubmitting}
                          >
                            Đổi địa chỉ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`w-full px-4 py-3 rounded-lg transition-colors ${
                          errors.recipient?.address
                            ? "bg-red-600 hover:bg-red-700 border-red-500 error-input"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                        onClick={() => setShowAddressModal(true)}
                        disabled={isSubmitting}
                      >
                        Chọn địa chỉ giao hàng
                      </button>
                    )}
                    {errors.recipient?.address && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.recipient.address}
                      </p>
                    )}

                    <textarea
                      placeholder="Ghi chú đơn hàng (tùy chọn)"
                      value={recipientInfo.note}
                      onChange={(e) =>
                        handleRecipientInfoChange("note", e.target.value)
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:border-blue-500"
                      disabled={isSubmitting}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {recipientInfo.note.length}/500 ký tự
                    </p>

                    <select
                      value={shippingProvider}
                      onChange={(e) => setShippingProvider(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="Giao hàng tiêu chuẩn">
                        Giao hàng tiêu chuẩn
                      </option>
                      <option value="GHN">Giao hàng nhanh (GHN)</option>
                      <option value="J&T">J&T Express</option>
                    </select>
                  </div>
                </div>

                <Modal
                  open={showAddressModal}
                  title="Chọn địa chỉ giao hàng"
                  onCancel={() => setShowAddressModal(false)}
                  footer={null}
                  width={600}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Địa chỉ đã lưu</h3>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={() => navigate("/accounts/my-addresses")}
                      disabled={isSubmitting}
                    >
                      Thêm địa chỉ mới
                    </button>
                  </div>
                  <ul className="space-y-3 max-h-[400px] overflow-y-auto">
                    {addressList.map((addr) => (
                      <li
                        key={addr._id}
                        className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {addr.name} - {addr.phone}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {addr.address}
                            </p>
                            {addr.default && (
                              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Địa chỉ mặc định
                              </span>
                            )}
                          </div>
                          <button
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={() => {
                              console.log("Chọn địa chỉ:", addr);
                              setRecipientInfo((prev) => ({
                                ...prev,
                                name: addr.name,
                                phone: addr.phone,
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
                        </div>
                      </li>
                    ))}
                  </ul>
                </Modal>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-700">
                    Phương thức thanh toán
                  </h3>
                  <div className="space-y-3">
                    {!isHighValueOrder && (
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === "COD"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio h-5 w-5 text-green-600"
                          disabled={isSubmitting}
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </label>
                    )}
                    {["VNPAY", "Momo"].map((method) => (
                      <label
                        key={method}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio h-5 w-5 text-green-600"
                          disabled={isSubmitting}
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          {method === "VNPAY"
                            ? "Thanh toán VNPay"
                            : "Thanh toán qua MoMo"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className={`mt-10 w-full bg-green-600 text-white font-semibold py-4 rounded-lg transition-all ${
                    isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-700 hover:shadow-lg"
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
                      key={`${item.productId}-${item.color || ""}-${
                        item.storage || ""
                      }`}
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
                          <p className="text-sm text-gray-500">
                            Màu: {item.color}
                          </p>
                        )}
                        {item.storage && (
                          <p className="text-sm text-gray-500">
                            Dung lượng: {item.storage}
                          </p>
                        )}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {(item.price * item.soluong).toLocaleString("vi-VN")}{" "}
                        VND
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t border-gray-300 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Tạm tính:</span>
                    <span>{totalPrice.toLocaleString("vi-VN")} VND</span>
                  </div>

                  {discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600 text-lg font-medium">
                        <span>Khuyến mãi (voucher):</span>
                        <span>
                          -{discountAmount.toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                      <div className="text-sm text-green-700 italic bg-green-50 p-2 rounded">
                        Mã giảm giá: <strong>{voucherCode}</strong>{" "}
                        {voucherInfo?.name && `– ${voucherInfo.name}`}
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>Phí vận chuyển:</span>
                    <span>{shippingFee.toLocaleString("vi-VN")} VND</span>
                  </div>

                  {orderDiscount > 0 && showOrderDiscountLine && (
                    <div className="flex justify-between text-green-600 text-lg font-medium">
                      <span>Giảm giá thành tích:</span>
                      <span>-{orderDiscount.toLocaleString("vi-VN")} VND</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {totalWithDiscountAndShipping.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg text-blue-900 text-sm">
                  {paymentMethod === "COD" &&
                    "Bạn sẽ thanh toán khi nhận hàng."}
                  {paymentMethod === "Momo" &&
                    "Bạn sẽ chuyển đến trang thanh toán MoMo"}
                  {paymentMethod === "VNPAY" &&
                    "Bạn sẽ chuyển đến trang thanh toán VNPAY"}
                  {orderDiscount > 0 && (
                    <p className="mt-2 font-medium">
                      🎉 Bạn được giảm {orderDiscount.toLocaleString("vi-VN")}{" "}
                      VND nhờ có {completedOrderCount} đơn hàng hoàn thành!
                    </p>
                  )}
                  {isHighValueOrder && (
                    <p className="mt-2 font-medium text-red-600">
                      ⚠️ Đơn hàng trên 50 triệu không hỗ trợ thanh toán COD.
                    </p>
                  )}
                </div>

                <VoucherInput onApply={handleApplyVoucher} />
              </div>
            </div>
          </div>
        </Spin>
      )}
    </div>
  );
};

export default Checkout;
