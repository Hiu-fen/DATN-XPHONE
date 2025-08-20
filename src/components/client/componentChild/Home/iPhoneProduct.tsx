import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaHeart,
  FaApple,
  FaShippingFast,
} from "react-icons/fa";
import { Spin, message, Tag } from "antd";
import { IProduct } from "../../../../interface/product";
import { Link } from "react-router-dom";
import SkeletonCard from "./SkeletonCard";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/client/productApiClient";
import dayjs from "dayjs";

const IphoneProducts: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId: string | undefined = user._id;

  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
    refetchOnWindowFocus: false,
  });

  const iphoneProducts: IProduct[] =
    allProducts?.filter((item) => item.danhmuc === "6841178c7543156eb6b12336") || [];

  const displayedIphoneProducts = showAll
    ? iphoneProducts
    : iphoneProducts.slice(0, 8);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (!userId) return;
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/users/${userId}`
        );
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
      if (data.likeList.includes(productId)) {
        message.success("Đã thêm vào yêu thích");
      } else {
        message.success("Đã bỏ yêu thích");
      }
    } catch (error) {
      message.error("Không thể cập nhật yêu thích.");
    }
  };

  const isNewProduct = (createdAt: string): boolean => {
    const createdDate = dayjs(createdAt);
    const now = dayjs();
    return now.diff(createdDate, "day") <= 5;
  };

  return (
    <div className="mx-6 md:mx-20 py-6">
      <h3 className="text-center text-3xl font-bold mb-6 text-green-700 flex justify-center items-center gap-2">
        <FaApple className="text-green-600" />
        iPhone - Sản phẩm nổi bật
      </h3>

      <Spin spinning={isLoading} size="large" tip="Đang tải sản phẩm...">
        {!isLoading && iphoneProducts.length === 0 && (
          <p className="text-center text-gray-500 text-lg py-20">
            Không có sản phẩm nào để hiển thị.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mx-4">
          {isLoading && iphoneProducts.length === 0
            ? Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))
            : displayedIphoneProducts.map((product) => (
              <div
                key={product._id}
                className="relative border rounded-xl shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between group bg-green-50 hover:bg-green-100"
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* ✅ Tags nằm cạnh nhau sử dụng AntD */}
                  <div className="absolute top-2 left-2 flex">
                    {isNewProduct(product.createdAt!) && (
                      <Tag color="red" className="px-2 py-0.5 text-xs">
                        Mới
                      </Tag>
                    )}
                    <Tag
                      color="blue"
                      className="px-2 py-0.5 text-xs flex items-center gap-1"
                    >
                      <FaShippingFast />
                      Miễn phí ship
                    </Tag>
                  </div>

                  {/* Nút xem & thích */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="flex flex-col gap-2 bg-green-600/30 p-1 rounded-full">
                      <Link
                        to={`/detail/${product._id}`}
                        className="flex justify-center items-center w-9 h-9 rounded-full bg-white hover:bg-green-100 transition"
                      >
                        <FaEye size={14} className="text-green-700" />
                      </Link>
                      <button
                        onClick={() => handleLike(product._id!)}
                        className={`flex justify-center items-center w-9 h-9 rounded-full transition ${likedProducts.includes(product._id!)
                          ? "bg-green-600 text-white"
                          : "bg-white hover:bg-green-100"
                          }`}
                      >
                        <FaHeart size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="p-3">
                  <h3 className="font-semibold text-lg mb-1 truncate text-green-700">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.mota}
                  </p>
                  <p className="text-red-500 font-bold text-base mt-1">
                    Giá từ:{" "}
                    {product.variants?.[0]?.price?.toLocaleString()}₫
                  </p>
                </div>
              </div>
            ))}
        </div>

        {iphoneProducts.length > 8 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-5 py-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition"
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
