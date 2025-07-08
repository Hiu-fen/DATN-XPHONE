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
          <div className="col-span-full">
            <Spin tip="Đang tải..." size="large">
              <div className="p-4">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            </Spin>
          </div>
        );
      }
      if (categoriesError || !categories || categories.length === 0) return null;

      return (
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Danh mục nổi bật
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/product?category=${cat._id}`}
                className="group block text-center"
                onClick={() => setActiveSubmenu(null)}
              >
                <div className="w-full max-w-[140px] mx-auto aspect-square overflow-hidden rounded-lg border border-gray-200 group-hover:shadow-md transition">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h4 className="mt-2 text-sm font-medium text-gray-800 group-hover:text-black transition">
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
          <div className="col-span-full">
            <Spin tip="Đang tải..." size="large">
              <div className="p-4">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            </Spin>
          </div>
        );
      }
      if (productsError || !products) return null;

      const filteredProducts = filterProductsByCategory(item.categoryId);
      if (filteredProducts.length === 0) return null;

      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 w-full">
          {filteredProducts.map((prod) => (
            <Link
              key={prod._id}
              to={`/detail/${prod._id}`}
              className="group block text-center"
              onClick={() => setActiveSubmenu(null)}
            >
              <div className="w-full max-w-[140px] mx-auto aspect-square overflow-hidden rounded-lg border border-gray-200 group-hover:shadow-md transition">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h4 className="mt-2 text-sm font-medium text-gray-800 group-hover:text-black transition">
                {prod.name}
              </h4>
            </Link>
          ))}
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
    <nav className="bg-gray-100 border-t relative z-[60] w-full">
      <div
        className="relative"
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        {/* Menu chính */}
        <div className="max-w-7xl mx-auto flex gap-4 sm:gap-6 px-4 py-2 text-gray-800 font-medium items-center whitespace-nowrap text-sm sm:text-base">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() =>
                item.submenuType ? setActiveSubmenu(index) : setActiveSubmenu(null)
              }
            >
              <Link
                to={item.path}
                className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 after:w-0 hover:after:w-full hover:text-black"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Overlay mờ nền khi submenu hiện */}
        {renderedSubmenu && (
          <div
            className="absolute left-0 right-0 top-full z-[50] pointer-events-none"
            /* Overlay mờ nền. 
               Fix z-index thấp hơn submenu để không che dropdown */
          >
            <div className="w-full h-[500px] bg-black/50 transition duration-300 ease-in-out"></div>
          </div>
        )}

        {/* Submenu chính */}
        {renderedSubmenu !== null && (
          <div
            className="absolute left-0 w-full bg-white shadow-xl border-t z-[60] animate-slideDown"
            /* Submenu có z-index cao hơn overlay */
          >
            <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {renderedSubmenu}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MenuNgangHeader;
