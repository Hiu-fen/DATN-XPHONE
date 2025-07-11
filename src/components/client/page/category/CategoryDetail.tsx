import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { IProduct } from "../../../../interface/product";
import { ICategory } from "../../../../interface/category";
import BannerClient from "../../componentChild/Home/banner";

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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

  // Lọc sản phẩm theo danh mục
  const filteredProducts = useMemo(() => {
    if (!products || !id) return [];
    return products.filter((product) => product.danhmuc === id);
  }, [products, id]);

  // Lấy thông tin danh mục
  const categoryInfo = useMemo(() => {
    if (!categories || !id) return null;
    return categories.find((cat) => cat._id === id);
  }, [categories, id]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div className="w-full">
        <BannerClient />
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh mục không tồn tại</h2>
          <Link to="/categorys" className="text-blue-600 hover:text-blue-800">
            ← Quay lại trang danh mục
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Banner */}
      <BannerClient />

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>→</span>
          <Link to="/categorys" className="hover:text-blue-600">Danh mục</Link>
          <span>→</span>
          <span className="text-gray-800 font-medium">{categoryInfo.name}</span>
        </nav>
      </div>

      {/* Header danh mục */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gray-300 rounded-2xl shadow p-4 flex items-center justify-center">
            <img
              src={categoryInfo.image}
              alt={categoryInfo.name}
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{categoryInfo.name}</h1>
            <p className="text-gray-600 mt-2">
              {filteredProducts.length} sản phẩm trong danh mục này
            </p>
          </div>
        </div>
      </div>

      {/* Lưới sản phẩm */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-[1400px] mx-auto p-4">
          {filteredProducts.map((product) => (
            <Link
              to={`/detail/${product._id}`}
              key={product._id}
              className="group bg-gray-300 rounded-2xl shadow overflow-hidden flex flex-col justify-between transition-all duration-300 hover:bg-gray-900 hover:text-white hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[120px] sm:h-[160px] md:h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-3 flex flex-col gap-2">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold line-clamp-2 group-hover:text-white">
                  {product.name}
                </h3>
                <p className="text-sm sm:text-lg md:text-xl text-red-600 font-bold group-hover:text-red-400">
                  {product.price.toLocaleString()} VND
                </p>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    product.trangthai === "còn hàng"
                      ? "bg-green-100 text-green-800 group-hover:bg-green-200 group-hover:text-green-900"
                      : "bg-red-100 text-red-800 group-hover:bg-red-200 group-hover:text-red-900"
                  }`}
                >
                  {product.trangthai}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-6">
              Danh mục {categoryInfo.name} hiện chưa có sản phẩm nào. Hãy quay lại sau!
            </p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả danh mục
            </Link>
          </div>
        </div>
      )}

      {/* Nút quay lại */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Link
            to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <span>←</span>
          <span>Quay lại trang chủ</span>
        </Link>
      </div>
    </div>
  );
};

export default CategoryDetail; 