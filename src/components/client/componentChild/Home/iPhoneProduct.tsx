import React, { useEffect, useState } from "react";
import { FaEye, FaHeart } from "react-icons/fa";
import { Spin, message } from "antd";
import { IProduct } from "../../../../interface/product";
import { Link } from "react-router-dom";
import SkeletonCard from "./SkeletonCard";
import axios from "axios";

type Props = {
  products: IProduct[];
  isLoading: boolean;
  showAll: boolean;
  onToggleShowAll: () => void;
  totalProducts: number;
};

const IphoneProducts: React.FC<Props> = ({
  products,
  isLoading,
  showAll,
  onToggleShowAll,
  totalProducts,
}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId: string | undefined = user._id;

  const [likedProducts, setLikedProducts] = useState<string[]>([]);

  useEffect(() => {
    // Nếu user đã đăng nhập, gọi API để lấy danh sách liked sản phẩm ban đầu
    const fetchLikedProducts = async () => {
      if (!userId) return;

      try {
        const { data } = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setLikedProducts(data.like || []);
      } catch (error) {
        console.error("Không thể lấy danh sách like.");
      }
    };

    fetchLikedProducts();
  }, [userId]);

  const handleLike = async (productId: string) => {
  if (!userId) {
    message.warning("Bạn cần đăng nhập để thích sản phẩm.");
    return;
  }

  try {
    const { data } = await axios.patch(
      `http://localhost:5000/api/users/${userId}/like`,
      { productId }
    );

    setLikedProducts(data.likeList);

    // Hiển thị thông báo tương ứng
    if (data.likeList.includes(productId)) {
      message.success("Đã thêm vào yêu thích");
    } else {
      message.success("Đã bỏ yêu thích");
    }
  } catch (error) {
    message.error("Không thể cập nhật yêu thích.");
  }
};


  return (
    <div className="mx-20 py-4">
      <h3 className="text-center text-3xl font-semibold mb-2">Apple</h3>

      <Spin spinning={isLoading} size="large" tip="Đang tải sản phẩm...">
        {!isLoading && products.length === 0 && (
          <p className="text-center text-gray-500 text-lg py-20">
            Không có sản phẩm nào để hiển thị.
          </p>
        )}

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 p-4">
            {isLoading && products.length === 0
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))
              : products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white text-black rounded p-2 border transition"
                  >
                    <div className="relative group overflow-hidden rounded">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-2 bg-white/60 opacity-0 group-hover:opacity-100 transition p-1 rounded-l">
                        <Link
                          to={`/detail/${product._id}`}
                          className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-black hover:text-white transition"
                        >
                          <FaEye size={16} />
                        </Link>
                        <button
                          onClick={() => handleLike(product._id!)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-full transition ${
                            likedProducts.includes(product._id!)
                              ? "bg-red-200 text-red-600 border-red-400"
                              : "hover:bg-black hover:text-white"
                          }`}
                        >
                          <FaHeart size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.mota}
                      </p>
                      <p className="text-red-500 font-bold text-base mt-1">
                        Giá từ:{" "}
                        {product.variants?.[0]?.price?.toLocaleString()}₫
                      </p>
                      {product.variants && product.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.variants.map((variant, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 px-2 py-1 border rounded"
                            >
                              {variant.ram} - {variant.color}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {totalProducts > 8 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onToggleShowAll}
              className="px-6 py-2 border-2 rounded hover:bg-black hover:text-white transition"
            >
              {showAll ? "Thu gọn" : "Xem thêm"}
            </button>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default IphoneProducts;
