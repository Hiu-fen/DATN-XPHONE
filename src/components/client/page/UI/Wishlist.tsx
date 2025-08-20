import { useEffect, useState } from "react";
import { HeartFilled } from "@ant-design/icons";
import { Spin, message, Rate } from "antd";
import axios from "axios";
import { IProduct } from "../../../../interface/product";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId: string | undefined = user._id;

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!userId) {
      message.warning("Bạn chưa đăng nhập!");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${userId}/liked-products`
      );
      setWishlist(res.data);
    } catch (err) {
      message.error("Không thể lấy danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  // Handle unlike action
  const handleUnlike = async (productId: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/${userId}/like`, {
        productId,
      });
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      message.success("Đã bỏ yêu thích");
    } catch (err) {
      message.error("Không thể bỏ yêu thích.");
    }
  };

  return (
    <div className="mx-4 sm:mx-8 md:mx-12 lg:mx-16 py-8">
      {/* Header */}
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-12 flex items-center gap-4 text-gray-900">
        <HeartFilled className="text-red-500 text-3xl" /> Các sản phẩm yêu thích
      </h3>

      <Spin spinning={loading}>
        {wishlist.length === 0 ? (
          <p className="text-center text-gray-600 text-lg font-medium py-10">
            Bạn chưa có sản phẩm yêu thích nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {wishlist.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/detail/${item._id}`)}
                className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden min-w-[280px] group"
              >
                {/* Product Image */}
                <div className="relative w-full h-64 md:h-72">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Unlike Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlike(item._id!);
                    }}
                    className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-sm hover:bg-red-50 text-red-500 transition-colors duration-200 hover:scale-110"
                  >
                    <HeartFilled className="text-base" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {item.name}
                  </h2>
                  <p className="text-red-500 font-bold text-lg md:text-xl mb-2">
                    {item.price.toLocaleString("vi-VN")}₫
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Còn lại: {item.soluong} sản phẩm
                  </p>
                  <Rate
                    disabled
                    allowHalf
                    value={item.rating || 4}
                    className="text-yellow-400 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Wishlist;