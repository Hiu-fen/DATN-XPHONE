import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">(
    "success"
  );
  const { user } = useUser();
  const userId = user?._id || null;

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatPrice = (priceString: string) => {
    const price = Number(priceString);
    if (isNaN(price)) return "";
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const getProductCart = async () => {
    try {
      const [cartRes, productsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/carts/${userId}`),
        axios.get("http://localhost:5000/api/products"),
      ]);
      setCartItems(cartRes.data.items);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      showToastMessage("Không thể tải giỏ hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) getProductCart();
  }, [userId]);

  const getProductById = (id: string) => products.find((p) => p._id === id);

  const updateCartOnServer = async (updatedItems: ICartItem[]) => {
    try {
      await axios.put(`http://localhost:5000/api/carts/${userId}`, {
        items: updatedItems,
      });
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng:", error);
    }
  };

  const updateCartItems = (updatedItems: ICartItem[]) => {
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
  };

  const handleQuantityChange = (
    productId: string,
    color: string,
    storage: string,
    delta: number
  ) => {
    const updatedItems = cartItems.map((item) => {
      if (
        item.productId === productId &&
        item.color === color &&
        item.storage === storage
      ) {
        const product = getProductById(productId);
        const variant = product?.variants?.find(
          (v) => v.color === color && v.ram === storage
        );
        const maxStock = variant?.soluong || 1;
        const newQuantity = item.quantity + delta;

        if (newQuantity < 1) {
          showToastMessage("Số lượng không được nhỏ hơn 1", "error");
          return item;
        }

        if (newQuantity > maxStock) {
          showToastMessage("Số lượng sản phẩm không đủ trong kho", "error");
          return item;
        }

        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    updateCartItems(updatedItems);
    updateCartOnServer(updatedItems);
  };

  const handleRemove = (itemId: string) => {
    const updatedItems = cartItems.filter((item) => item._id !== itemId);
    updateCartItems(updatedItems);
    updateCartOnServer(updatedItems);
    setSelectedItems(selectedItems.filter((id) => id !== itemId));
    showToastMessage("Xóa thành công", "success");
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item._id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleCheckout = async () => {
    if (!userId) {
      showToastMessage("Bạn chưa đăng nhập", "error");
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
      const item = cartItems.find((i) => i._id === itemId);
      const product = getProductById(item?.productId || "");
      const variant = product?.variants?.find(
        (v) => v.color === item?.color && v.ram === item?.storage
      );
      return item && variant && item.quantity > (variant.soluong || 0);
    });

    if (hasInvalidQuantity) {
      showToastMessage(
        "Một hoặc nhiều sản phẩm vượt quá số lượng tồn kho",
        "error"
      );
      return;
    }

    try {
      const selectedCartItems = cartItems.filter((item) =>
        selectedItems.includes(item._id)
      );
      navigate("/checkout", { state: { selectedItems: selectedCartItems } });
    } catch (error) {
      console.error("Lỗi khi lưu giỏ hàng trước khi checkout:", error);
      showToastMessage("Không thể lưu giỏ hàng. Vui lòng thử lại.", "error");
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, itemId) => {
      const item = cartItems.find((i) => i._id === itemId);
      if (!item) return total;

      const product = getProductById(item.productId);
      const variant = product?.variants?.find(
        (v) => v.color === item.color && v.ram === item.storage
      );
      const price = Number(variant?.price || product?.price || 0);
      return total + price * item.quantity;
    }, 0);
  };

  if (loading) {
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
              {cartItems.length > 0
                ? `${cartItems.length} sản phẩm trong giỏ hàng`
                : "Giỏ hàng trống"}
            </p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
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
              <div className="block lg:hidden space-y-4">
                {cartItems.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;

                  const variant = product.variants?.find(
                    (v) => v.color === item.color && v.ram === item.storage
                  );
                  const maxStock = variant?.soluong || 1;
                  const price = Number(variant?.price || product.price);

                  return (
                    <div
                      key={`${item.productId}-${item.color}-${item.storage}-${item.price}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                        />

                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-20 h-20 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>

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
                                {formatPrice(String(price))}
                              </div>
                              <div className="text-xs text-gray-500">
                                Tồn kho: {maxStock}
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
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
                                disabled={item.quantity >= maxStock}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-green-600">
                              {formatPrice(String(price * item.quantity))}
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
                  );
                })}
              </div>

              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={
                              selectedItems.length === cartItems.length &&
                              cartItems.length > 0
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
                      {cartItems.map((item, index) => {
                        const product = getProductById(item.productId);
                        if (!product) return null;

                        const variant = product.variants?.find(
                          (v) =>
                            v.color === item.color && v.ram === item.storage
                        );
                        const maxStock = variant?.soluong || 1;
                        const price = Number(variant?.price || product.price);

                        return (
                          <tr
                            key={`${item.productId}-${item.color}-${item.storage}-${item.price}`}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => handleSelectItem(item._id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-16 h-16 rounded-lg border border-gray-200 object-cover"
                                />
                                <span className="font-medium text-gray-900 line-clamp-2">
                                  {product.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-700">
                              {item.color || "-"}
                            </td>
                            <td className="px-6 py-4 text-center text-gray-700">
                              {item.storage || "-"}
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-red-600">
                              {formatPrice(String(price))}
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
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
                                  disabled={item.quantity >= maxStock}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaPlus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-xs text-gray-500 text-center mt-1">
                                Tồn kho: {maxStock}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-green-600">
                              {formatPrice(String(price * item.quantity))}
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
                        );
                      })}
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
                        {formatPrice(String(calculateTotal()))}
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