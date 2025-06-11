import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import { IProduct } from '../../../interface/product';
import { ICartItem } from '../../../interface/cart';
import { message } from 'antd';
import { useUser } from '../context/UserContext';


const Cart = () => {
const navigate = useNavigate();


  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
    const userId = user?._id || null;


  const formatPrice = (priceString: string) => {
    const price = Number(priceString);
    if (isNaN(price)) return '';
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const getProductCart = async () => {
    try {
      const [cartRes, productsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/carts/${userId}`),
        axios.get('http://localhost:5000/api/products'),
      ]);
      setCartItems(cartRes.data.items);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckout = async () => {
  if (!userId) {
    message.error("Bạn chưa đăng nhập");
    return;
  }

  try {
    // Gửi cartItems hiện tại lên server lưu lại
    await axios.put(`http://localhost:5000/api/carts/${userId}`, {
      items: cartItems,
    });
    // Sau khi lưu thành công thì chuyển trang checkout
    navigate("/checkout");
  } catch (error) {
    console.error("Lỗi khi lưu giỏ hàng trước khi checkout:", error);
    message.error("Không thể lưu giỏ hàng. Vui lòng thử lại.");
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
      console.error('Lỗi cập nhật giỏ hàng:', error);
    }
  };
  const updateCartItems = (updatedItems: ICartItem[]) => {
  setCartItems(updatedItems);
  localStorage.setItem('cartItems', JSON.stringify(updatedItems));
};

  const handleQuantityChange = (
  productId: string,
  color: string,
  storage: string,
  delta: number
) => {
  const updatedItems = cartItems.map((item) =>
    item.productId === productId &&
    item.color === color &&
    item.storage === storage
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item
  );
  updateCartItems(updatedItems);
  updateCartOnServer(updatedItems); // nếu bạn vẫn muốn cập nhật server
};

// Sửa lại handleRemove
const handleRemove = (itemId: string) => {
  const updatedItems = cartItems.filter(item => item._id !== itemId);
  updateCartItems(updatedItems);
  updateCartOnServer(updatedItems);
  message.success('Xóa thành công');
};

  const total = cartItems.reduce((acc, item) => {
    const product = getProductById(item.productId);
    const price = product ? Number(product.price) : 0;
    return acc + price * item.quantity;
  }, 0);

  if (loading) return <p>Đang tải giỏ hàng...</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-4 text-center"><input type="checkbox" className='w-4'/></th>
                <th className="p-4 text-center">STT</th>
                <th className="p-4 text-left">Sản phẩm</th>
                <th className="p-4 text-center">Màu sắc</th>
                <th className="p-4 text-center">Dung lượng</th>
                <th className="p-4 text-center">Đơn giá</th>
                <th className="p-4 text-center">Số lượng</th>
                <th className="p-4 text-center">Thành tiền</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => {
                const product = getProductById(item.productId);
                if (!product) return null; 

                return (
                  <tr
                    key={`${item.productId}-${item.color}-${item.storage}-${item.price}`}
                    className="border-t hover:bg-gray-50 transition-all"
                  >

                    <td className="p-4 text-center"><input type="checkbox" className='w-4'/></td>

                    <td className="text-center p-4 font-semibold">{index + 1}</td>
                    <td className="p-4 flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg border object-cover"
                      />
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </td>
                    <td className="text-center p-4">{item.color || '-'}</td>
                    <td className="text-center p-4">{item.storage || '-'}</td>
                   <td className="text-center p-4 text-red-500 font-medium">
                      {formatPrice(`${product.price}`)}
                    </td>

                    <td className="text-center p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.color, item.storage, -1)}
                          className="w-7 h-7 text-lg border rounded hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                         onClick={() => handleQuantityChange(item.productId, item.color, item.storage, 1)}
                          className="w-7 h-7 text-lg border rounded hover:bg-gray-100"
                        >
                          ＋
                        </button>
                      </div>
                    </td>
                    <td className="text-center p-4 font-semibold text-red-600">
                      {formatPrice(String(Number(product.price) * item.quantity))}
                    </td>
                   <td className="text-center p-4  gap-2 items-center justify-center">
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-sm text-red-600 font-semibold px-3 py-1 rounded border border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200 focus:outline-none"
                    >
                      Xóa
                    </button>
  
                  </td>


                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-6 px-4 pb-6">
            <Link to="/" className="text-blue-600 hover:underline text-sm mb-4 md:mb-0">
              ← Quay lại tiếp tục mua sắm
            </Link>
           
            <div className="text-right space-y-2">
              <p className="text-xl font-bold">
                Tổng Tiền: <span className="text-red-600">{formatPrice(String(total))}</span>
              </p>
              <button
  onClick={handleCheckout}
  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-semibold"
>
  Đặt hàng
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;