import { Link } from "react-router-dom";
import { getAllProducts } from "../../../../api/client/productApiClient";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "../../../../api/client/categoryApiClient";
import { ICategory } from "../../../../interface/category";
import { useState } from "react";
import { IProduct } from "../../../../interface/product";
import menuItems from "./MenuItem";
import { Skeleton, Spin } from "antd";

const MenuNgangHeader = () => {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  // Query lấy danh mục
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } =
    useQuery<ICategory[]>({
      queryKey: ["categories"],
      queryFn: async () => {
        const res = await getAllCategories();
        return res.data;
      },
    });

  // Query lấy sản phẩm
  const { data: products, isLoading: productsLoading, isError: productsError } =
    useQuery<IProduct[]>({
      queryKey: ["products"],
      queryFn: getAllProducts,
      refetchOnWindowFocus: false,
    });

  // Lọc sản phẩm theo categoryId
  const filterProductsByCategory = (categoryId: string) => {
    if (!products) return [];
    return products.filter((product) => product.danhmuc === categoryId);
  };

  // Render nội dung submenu (categories/products)
  const renderSubmenuContent = () => {
    if (activeSubmenu === null) return null;
    const item = menuItems[activeSubmenu];

    // Submenu loại categories
    if (item.submenuType === "categories") {
      if (categoriesLoading) {
        return (
          <div className="w-full flex justify-center py-8">
            <Spin tip="Đang tải..." size="large">
              <div className="p-4 min-h-[200px]">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            </Spin>
          </div>
        );
      }

      if (categoriesError || !categories || categories.length === 0) return null;

      return (
        <div className="w-full">
          <h3 className="text-lg font-semibold text-blue-600 mb-6 text-center">
            Danh mục nổi bật
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/product?category=${cat._id}`}
                className="group block text-center hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
                onClick={() => setActiveSubmenu(null)}
              >
                <div className="w-full max-w-[120px] mx-auto aspect-square overflow-hidden rounded-lg border border-gray-200 group-hover:shadow-lg transition-all duration-300 bg-white">
                  <img
                    src={cat.image || "/placeholder.svg"}
                    alt={cat.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h4 className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    // Submenu loại products
    if (item.submenuType === "products" && item.categoryId) {
      if (productsLoading) {
        return (
          <div className="w-full flex justify-center py-8">
            <Spin tip="Đang tải..." size="large">
              <div className="p-4 min-h-[200px]">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            </Spin>
          </div>
        );
      }

      if (productsError || !products) return null;

      const filteredProducts = filterProductsByCategory(item.categoryId);
      if (filteredProducts.length === 0) {
        return (
          <div className="w-full text-center py-8 text-gray-500">
            Không có sản phẩm nào trong danh mục này
          </div>
        );
      }

      return (
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {filteredProducts.slice(0, 12).map((prod) => (
              <Link
                key={prod._id}
                to={`/detail/${prod._id}`}
                className="group block text-center hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
                onClick={() => setActiveSubmenu(null)}
              >
                <div className="w-full max-w-[120px] mx-auto aspect-square overflow-hidden rounded-lg border border-gray-200 group-hover:shadow-lg transition-all duration-300 bg-white">
                  <img
                    src={prod.image || "/placeholder.svg"}
                    alt={prod.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h4 className="mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {prod.name}
                </h4>
              </Link>
            ))}
          </div>
          {filteredProducts.length > 12 && (
            <div className="text-center mt-6">
              <Link
                to={`/product?category=${item.categoryId}`}
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={() => setActiveSubmenu(null)}
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Submenu đã render
  const renderedSubmenu = renderSubmenuContent();

  // ==============================
  // JSX chính
  return (
    <nav className="bg-gray-100 border-t relative w-full" style={{ zIndex: 50 }}>
      <div
        className="relative"
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        {/* Menu chính */}
        <div className="max-w-7xl mx-auto flex gap-2 sm:gap-4 md:gap-6 px-4 py-3 text-gray-800 font-medium items-center overflow-x-auto scrollbar-hide">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="relative flex-shrink-0"
              onMouseEnter={() =>
                item.submenuType ? setActiveSubmenu(index) : setActiveSubmenu(null)
              }
            >
              <Link
                to={item.path}
                className={`
                  relative px-3 py-2 rounded-md text-sm sm:text-base whitespace-nowrap
                  transition-all duration-200 hover:text-blue-600 hover:bg-white
                  ${activeSubmenu === index ? 'text-blue-600 bg-white shadow-sm' : ''}
                  after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2
                  after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300
                  after:w-0 hover:after:w-3/4
                  ${activeSubmenu === index ? 'after:w-3/4' : ''}
                `}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Submenu chính */}
        {renderedSubmenu !== null && (
          <div
            className="absolute left-0 w-full bg-white shadow-2xl border-t border-gray-200"
            style={{ 
              zIndex: 60,
              animation: 'slideDown 0.3s ease-out',
              transformOrigin: 'top'
            }}
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              {renderedSubmenu}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation inline */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </nav>
  );
};

export default MenuNgangHeader;