import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Modal } from "antd";
import { IProduct } from "../../../../interface/product";
import { ICartItem } from "../../../../interface/cart";
import { useUser } from "../../context/UserContext";
import {
  FaShoppingCart,
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaShoppingBag,
} from "react-icons/fa";

interface EnrichedCartItem extends ICartItem {
  productName: string;
  image: string;
  isAvailable: boolean;
  price: number;
  maxStock: number;
  orderIndex: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?._id || null;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "success"
  );
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatPrice = (price: number) => {
    if (isNaN(price)) return "Không có giá";
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Check if total value exceeds 100 million VND
  const isHighValueOrder = (total: number): boolean => {
    const threshold = 200000000; // 200 triệu VND
    const isHigh = total > threshold;
    if (isHigh) {
      console.log("💎 High value order detected:", {
        totalValue: total.toLocaleString(),
        threshold: threshold.toLocaleString(),
      });
    }
    return isHigh;
  };

  // Fetch cart items
  const {
    data: cartItems = [],
    isLoading: isLoadingCart,
    error: cartError,
  } = useQuery({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axios.get(`http://localhost:5000/api/carts/${userId}`, {
        withCredentials: true,
      });
      console.log("✅ Đã lấy giỏ hàng:", res.data.items);
      return res.data.items as ICartItem[];
    },
    enabled: !!userId,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  // Fetch products
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/products", {
        withCredentials: true,
      });
      console.log("✅ Đã lấy danh sách sản phẩm:", res.data);
      return res.data as IProduct[];
    },
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  // Enrich cart items with product details
  const enrichedCartItems: EnrichedCartItem[] = cartItems
    .map((item: ICartItem, index: number) => {
      const product = products.find(
        (p) => String(p._id) === String(item.productId)
      );

      if (product) {
        const variant = product.variants?.find(
          (v) =>
            String(v.color).trim().toLowerCase() ===
              String(item.color).trim().toLowerCase() &&
            String(v.ram).trim().toLowerCase() ===
              String(item.storage).trim().toLowerCase()
        );

        const variantStock = variant?.soluong ?? 0;
        const imageToUse =
          variant?.image ||
          item.image ||
          product.albumImages?.find((img) =>
            item.color
              ? img.toLowerCase().includes(item.color.toLowerCase())
              : false
          ) ||
          product.image ||
          product.albumImages?.[0];

        return {
          ...item,
          productName: product.name,
          image: imageToUse,
          isAvailable: !!variant && variantStock > 0 && product.status !== false,
          price: variant?.price ?? product.price,
          maxStock: variantStock,
          orderIndex: index,
        };
      } else {
        return {
          ...item,
          productName: item.name || "Sản phẩm không còn được bán",
          image: item.image,
          isAvailable: false,
          price: item.price || 0,
          maxStock: 0,
          orderIndex: index,
        };
      }
    })
    .sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return b.orderIndex - a.orderIndex;
    });

  // Mutation to update cart on server
  const updateCartMutation = useMutation({
    mutationFn: async (updatedItems: ICartItem[]) => {
      await axios.put(
        `http://localhost:5000/api/carts/${userId}`,
        { items: updatedItems },
        { withCredentials: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
    onError: (error: AxiosError) => {
      console.error("Lỗi cập nhật giỏ hàng:", error);
      showToastMessage("Không thể cập nhật giỏ hàng", "error");
    },
  });

  // Mutation to remove item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const updatedItems = cartItems.filter((item) => item._id !== itemId);
      await updateCartMutation.mutateAsync(updatedItems);
    },
    onSuccess: (_data, itemId) => {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      showToastMessage("Xóa thành công", "success");
    },
    onError: () => {
      showToastMessage("Xóa thất bại", "error");
    },
  });

  // Update local storage when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleQuantityChange = (
    productId: string,
    color: string,
    storage: string,
    delta: number
  ) => {
    const item = enrichedCartItems.find(
      (i) =>
        i.productId === productId && i.color === color && i.storage === storage
    );
    if (!item || !item.isAvailable) {
      showToastMessage("Sản phẩm không còn được bán", "warning");
      return;
    }

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      showToastMessage("Số lượng không được nhỏ hơn 1", "error");
      return;
    }
    if (newQuantity > item.maxStock) {
      showToastMessage("Số lượng sản phẩm không đủ trong kho", "error");
      return;
    }

    const updatedItems = cartItems.map((i) =>
      i.productId === productId && i.color === color && i.storage === storage
        ? { ...i, quantity: newQuantity }
        : i
    );
    updateCartMutation.mutate(updatedItems);
  };

  const handleRemove = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleSelectAll = () => {
    const availableItems = enrichedCartItems.filter((item) => item.isAvailable);
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems.map((item) => item._id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    const item = enrichedCartItems.find((i) => i._id === itemId);
    if (!item?.isAvailable) {
      showToastMessage(
        "Sản phẩm không còn được bán, không thể chọn",
        "warning"
      );
      return;
    }

    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleCheckout = () => {
    if (!userId) {
      showToastMessage("Bạn chưa đăng nhập", "error");
      navigate("/login");
      return;
    }

    if (selectedItems.length === 0) {
      showToastMessage(
        "Vui lòng chọn ít nhất một sản phẩm để thanh toán",
        "warning"
      );
      return;
    }

    const hasInvalidQuantity = selectedItems.some((itemId) => {
      const item = enrichedCartItems.find((i) => i._id === itemId);
      return item && item.quantity > item.maxStock;
    });

    if (hasInvalidQuantity) {
      showToastMessage(
        "Một hoặc nhiều sản phẩm vượt quá số lượng tồn kho",
        "error"
      );
      return;
    }

    const totalValue = calculateTotal();
    if (isHighValueOrder(totalValue)) {
      console.log("💎 Showing contact modal for high value cart");
      setIsContactModalOpen(true);
      return;
    }

    const selectedCartItems = enrichedCartItems.filter((item) =>
      selectedItems.includes(item._id)
    );
    navigate("/checkout", { state: { selectedItems: selectedCartItems } });
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = enrichedCartItems.find((i) => i._id === itemId);
      if (!item) return total;
      return total + item.price * item.quantity;
    }, 0);
  };

  // Handle contact modal actions
  const handleContactModalOk = () => {
    navigate("/contact");
    setIsContactModalOpen(false);
  };

  const handleContactModalCancel = () => {
    setIsContactModalOpen(false);
  };

  if (isLoadingCart || isLoadingProducts) {
    return (
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Đang tải giỏ hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError || productsError) {
    return (
      <div className="pt-20 pb-8 min-h-screen">
        <div className="bg-gray-50 min-h-full">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FaExclamationTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Lỗi khi tải giỏ hàng. Vui lòng thử lại.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 min-h-screen">
      <div className="bg-gray-50 min-h-full">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
                toastType === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : toastType === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              {toastType === "success" && <FaCheck className="w-5 h-5" />}
              {toastType === "error" && <FaTimes className="w-5 h-5" />}
              {toastType === "warning" && (
                <FaExclamationTriangle className="w-5 h-5" />
              )}
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* High Value Order Modal */}
        <Modal
          title={
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-4 rounded-t-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <span>Đơn hàng cao cấp - Cần tư vấn</span>
              </div>
            </div>
          }
          open={isContactModalOpen}
          onOk={handleContactModalOk}
          onCancel={handleContactModalCancel}
          okText="Liên hệ ngay"
          cancelText="Đóng"
          width={600}
          className="rounded-lg"
          styles={{ body: { padding: "24px", background: "#fefdf8" } }}
          okButtonProps={{
            className:
              "bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 h-auto",
          }}
          cancelButtonProps={{
            className:
              "border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 h-auto",
          }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💎</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Đơn hàng cao cấp trên 200 triệu VNĐ
              </h3>
              <p className="text-gray-600">
                Để đảm bảo bạn nhận được sự tư vấn tốt nhất và chính sách hỗ trợ
                đặc biệt
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">
                Chi tiết đơn hàng
              </h4>
              {selectedItems.map((itemId) => {
                const item = enrichedCartItems.find((i) => i._id === itemId);
                if (!item) return null;
                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 mb-3 last:mb-0"
                  >
                    <img
                      src={item.image || "/default-image.jpg"}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className={`font-semibold text-gray-900 ${item.isAvailable ? '' : 'line-through'}`}>
                        {item.productName}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Đơn giá: {formatPrice(item.price)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                        <p className="text-red-600 font-bold">
                          Tổng: {formatPrice(item.price * item.quantity)}
                        </p>
                        {(item.color || item.storage) && (
                          <p className="text-sm text-gray-600">
                            {item.color} {item.storage && `- ${item.storage}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-red-600 font-bold text-lg">
                  Tổng giá trị: {formatPrice(calculateTotal())}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                🎯 Lợi ích khi liên hệ trực tiếp:
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Tư vấn chuyên sâu từ đội ngũ chuyên gia
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Chính sách ưu đãi và hỗ trợ đặc biệt cho đơn hàng lớn
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Dịch vụ giao hàng và bảo hành VIP
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Hỗ trợ trả góp 0% lãi suất cho đơn hàng lớn
                </li>
              </ul>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Hành động: <strong>Thanh toán đơn hàng</strong></p>
              <p className="mt-1">
                Nhấn "Liên hệ ngay" để được tư vấn chi tiết về đơn hàng này
              </p>
            </div>
          </div>
        </Modal>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 pt-8">
            <div className="flex items-center gap-3 mb-2">
              <FaShoppingCart className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Giỏ hàng của bạn
              </h1>
            </div>
            <p className="text-gray-600">
              {enrichedCartItems.length > 0
                ? `${enrichedCartItems.length} sản phẩm trong giỏ hàng`
                : "Giỏ hàng trống"}
            </p>
          </div>

          {enrichedCartItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 mb-6">
                Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy bắt đầu mua sắm
                ngay!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mobile View */}
              <div className="block lg:hidden space-y-4">
                {enrichedCartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.storage}-${item.price}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        disabled={!item.isAvailable}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 disabled:opacity-50"
                      />
                      <Link to={`/detail/${item.productId}`}>
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-20 h-20 rounded-lg border border-gray-200 object-cover flex-shrink-0 hover:opacity-90 transition"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/detail/${item.productId}`}
                          className="block"
                        >
                          <h3
                            className={`font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 hover:underline transition ${
                              item.isAvailable ? "" : "line-through"
                            }`}
                          >
                            {item.productName}
                          </h3>
                        </Link>
                        {!item.isAvailable && (
                          <p className="text-red-600 font-semibold mb-3">
                            Sản phẩm đã ngừng bán
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Màu:</span>{" "}
                            {item.color || "-"}
                          </div>
                          <div>
                            <span className="font-medium">Dung lượng:</span>{" "}
                            {item.storage || "-"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-semibold text-red-600">
                              {formatPrice(item.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Tồn kho: {item.maxStock}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.color,
                                  item.storage,
                                  -1
                                )
                              }
                              disabled={!item.isAvailable}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaMinus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.color,
                                  item.storage,
                                  1
                                )
                              }
                              disabled={
                                !item.isAvailable ||
                                item.quantity >= item.maxStock
                              }
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <FaTrash className="w-3 h-3" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={
                              selectedItems.length ===
                                enrichedCartItems.filter((i) => i.isAvailable)
                                  .length && enrichedCartItems.length > 0
                            }
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STT
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Màu sắc
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dung lượng
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Đơn giá
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành tiền
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enrichedCartItems.map((item, index) => (
                        <tr
                          key={`${item.productId}-${item.color}-${item.storage}-${item.price}`}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                              disabled={!item.isAvailable}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <Link to={`/detail/${item.productId}`}>
                                <div className="relative w-20 h-20">
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                    className="w-20 h-20 rounded-lg border border-gray-200 object-cover flex-shrink-0 hover:opacity-90 transition"
                                  />
                                  {!item.isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                      <span className="text-white text-xs font-semibold">
                                        Không có sẵn
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </Link>
                              <div>
                                <Link
                                  to={`/detail/${item.productId}`}
                                  className="block"
                                >
                                  <span
                                    className={`font-medium text-gray-900 line-clamp-2 hover:text-blue-600 hover:underline transition ${
                                      item.isAvailable ? "" : "line-through"
                                    }`}
                                  >
                                    {item.productName}
                                  </span>
                                </Link>
                                {!item.isAvailable && (
                                  <p className="text-red-600 font-semibold mt-1">
                                    Hàng không còn bán
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700">
                            {item.color || "-"}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-700">
                            {item.storage || "-"}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-red-600">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.color,
                                    item.storage,
                                    -1
                                  )
                                }
                                disabled={!item.isAvailable}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.color,
                                    item.storage,
                                    1
                                  )
                                }
                                disabled={
                                  !item.isAvailable ||
                                  item.quantity >= item.maxStock
                                }
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                            <div
                              className={`text-xs text-center ${
                                item.isAvailable
                                  ? "text-gray-500"
                                  : "text-red-600"
                              }`}
                            >
                              {item.isAvailable
                                ? `Tồn kho: ${item.maxStock}`
                                : "không có sẵn"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-green-600">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            >
                              <FaTrash className="w-3 h-3" />
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    Tiếp tục mua sắm
                  </Link>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        Tổng tiền ({selectedItems.length} sản phẩm)
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(calculateTotal())}
                      </div>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={selectedItems.length === 0}
                      className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đặt hàng ({selectedItems.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;