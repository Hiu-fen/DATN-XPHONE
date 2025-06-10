import React, { useState, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import BannerClient from "../componentChild/Home/banner";
import { IProduct } from "../../../interface/product";
import { ICategory } from "../../../interface/category";
import { useCart } from "../context/CartContext";

interface CartItem {
  productId: string;
  productName: string;
  price: number;   // Kiểu string, vì addToCart định nghĩa price là string
  soluong: number;
  image: string;
}

const Categorys: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Fetch danh sách danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery<ICategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/category");
      return res.data;
    },
  });

  // Fetch danh sách sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery<IProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/products");
      return res.data;
    },
  });

  
  // Scroll container cho slider danh mục
  const scrollLeft = () => {
    const container = document.getElementById("scroll-container");
    if (container) container.scrollLeft -= 200;
  };

  const scrollRight = () => {
    const container = document.getElementById("scroll-container");
    if (container) container.scrollLeft += 200;
  };

  // Lọc sản phẩm theo danh mục đã chọn
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedCategoryId) return products;
    return products.filter((product) => product.danhmuc === selectedCategoryId);
  }, [products, selectedCategoryId]);

  // Lấy tên danh mục đã chọn
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId || !categories) return "";
    const category = categories.find((cat) => cat._id === selectedCategoryId);
    return category ? category.name : "";
  }, [selectedCategoryId, categories]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Banner */}
      <BannerClient />

      {/* Slider danh mục */}
      <div className="w-full flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-bold my-4 text-center">Danh mục</h2>
        <div className="relative w-full px-4 overflow-hidden">
          <button
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 text-gray-600 rounded-full w-8 h-8 text-sm md:w-9 md:h-9 md:text-lg flex items-center justify-center hover:bg-gray-100 z-10"
            onClick={scrollLeft}
          >
            ←
          </button>
          <div
            id="scroll-container"
            className="flex gap-3 overflow-x-auto scroll-smooth px-10 py-2 no-scrollbar"
          >
            {categories?.map((cat) => (
              <div
                key={cat._id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedCategoryId(cat._id)}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className={`w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-cover rounded-lg border transition-transform hover:scale-105 ${
                    selectedCategoryId === cat._id ? "ring-4 ring-blue-500" : ""
                  }`}
                />
                <span className="mt-2 text-sm text-gray-600">{cat.name}</span>
              </div>
            ))}
          </div>
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 text-gray-600 rounded-full w-8 h-8 text-sm md:w-9 md:h-9 md:text-lg flex items-center justify-center hover:bg-gray-100 z-10"
            onClick={scrollRight}
          >
            →
          </button>
        </div>
      </div>

      {/* Nút hiển thị tất cả khi đang lọc */}
      {selectedCategoryId && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Hiện tất cả sản phẩm
          </button>
        </div>
      )}

      {/* Tiêu đề và số lượng sản phẩm */}
      <div className="mb-2 text-center">
        <h2 className="text-xl md:text-2xl font-bold my-4">
          {selectedCategoryId
            ? `Sản phẩm ${selectedCategoryName}`
            : "Tất cả sản phẩm"}
        </h2>
        <p className="text-gray-600">
          {selectedCategoryId
            ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục ${selectedCategoryName}`
            : `Hiển thị ${filteredProducts.length} sản phẩm`}
        </p>
      </div>

      {/* Lưới sản phẩm */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-[1400px] mx-auto p-4">
  {filteredProducts.map((product) => (
    <Link
      to={`/detail/${product._id}`}
      key={product._id}
      className="group bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-[120px] sm:h-[160px] md:h-[200px] object-cover"
      />
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm sm:text-lg md:text-xl text-red-600 font-bold">
          {product.price.toLocaleString()} VND
        </p>
        <span
          className={`text-sm px-2 py-1 rounded-full ${
            product.trangthai === "còn hàng"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.trangthai}
        </span>
      </div>
    </Link>
  ))}
</div>

      {/* Thông báo nếu không có sản phẩm */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {selectedCategoryId
              ? `Không tìm thấy sản phẩm nào trong danh mục ${selectedCategoryName}`
              : "Không tìm thấy sản phẩm nào"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Categorys;
