import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const SHIPPING_FEE = 35000;

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      message.error("Số lượng phải lớn hơn 0");
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.soluong,
    0
  );
  const totalWithShipping = totalPrice + SHIPPING_FEE;

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          Giỏ hàng của bạn
        </h1>

        {cart.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            Giỏ hàng trống, bạn hãy thêm sản phẩm vào giỏ hàng
          </p>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100 text-gray-700 text-sm">
                  <th className="py-3 px-2 text-left">STT</th>
                  <th className="py-3 px-2 text-left">Ảnh</th>
                  <th className="py-3 px-2 text-left">Tên sản phẩm</th>
                  <th className="py-3 px-2 text-left">Đơn giá</th>
                  <th className="py-3 px-2 text-left">Số lượng</th>
                  <th className="py-3 px-2 text-left">Thành tiền</th>
                  <th className="py-3 px-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr
                    key={item.productId}
                    className="border-b border-gray-200 hover:bg-gray-50 transition text-sm"
                  >
                    <td className="py-4 px-2">{index + 1}</td>

                    <td className="py-4 px-2">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded border border-gray-200"
                      />
                    </td>

                    <td className="py-4 px-2">
                      <p className="font-semibold text-base text-gray-800">
                        {item.productName}
                      </p>
                    </td>

                    <td className="py-4 px-2">
                      {item.price.toLocaleString()} VND
                    </td>

                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.soluong - 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        >
                          -
                        </button>
                        <span className="font-medium">{item.soluong}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.productId,
                              item.soluong + 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-2">
                      {(item.price * item.soluong).toLocaleString()} VND
                    </td>

                    <td className="py-4 px-2">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-600 font-medium transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Tổng tiền sản phẩm: {totalPrice.toLocaleString()} VND
                  </p>
                  <p className="text-lg font-semibold">
                    Phí ship: {SHIPPING_FEE.toLocaleString()} VND
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Tổng cộng: {totalWithShipping.toLocaleString()} VND
                  </h2>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => navigate("/categorys")}
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-all duration-300 group"
                >
                  <span className="text-2xl transition-transform group-hover:-translate-x-1">
                    ←
                  </span>
                  <span className="text-blue-700 group-hover:text-blue-900 font-semibold transition-all duration-300">
                    Quay lại mua sắm
                  </span>
                </button>

                <button
                  onClick={() => navigate("/checkout")}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-semibold"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
