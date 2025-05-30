import { useState } from 'react';
import { FaShoppingCart, FaUser, FaBell, FaHeart, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const ClientHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (

    <header className="bg-white shadow">
      {/* Phần trên: Logo, Tìm kiếm, Icon */}
      <div className="w-full bg-white sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 gap-3">
          {/* Logo */}
          <Link to="/" className="text-2xl sm:text-3xl font-bold text-red-600 whitespace-nowrap">
            XPhone
          </Link>

          {/* Search */}
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-grow mx-4 border p-2 rounded"
          />

          {/* Hamburger Icon */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:text-red-500 focus:outline-none"
            >
              <FaBars className="text-2xl" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10 p-4 flex flex-col gap-3 text-gray-600 text-sm sm:text-base w-40">
                <Link to="/wishlist" className="hover:text-red-500 flex items-center gap-2">
                  <FaHeart /> Yêu thích
                </Link>
                <Link to="/notifications" className="hover:text-red-500 flex items-center gap-2">
                  <FaBell /> Thông báo
                </Link>
                <Link to="/cart" className="hover:text-red-500 flex items-center gap-2">
                  <FaShoppingCart /> Giỏ hàng
                </Link>
                <Link to="/account" className="hover:text-red-500 flex items-center gap-2">
                  <FaUser /> Tài khoản
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu ngang */}
      <nav className="bg-gray-100 border-t overflow-x-auto w-full">
        <div className="max-w-7xl mx-auto flex gap-4 sm:gap-6 px-4 py-2 text-gray-700 font-medium items-center whitespace-nowrap text-sm sm:text-base">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <Link to="/about" className="hover:text-red-600">Giới thiệu</Link>
          <Link to="/product" className="hover:text-red-600">Sản phẩm</Link>
          <Link to="/categorys" className="hover:text-red-600">Danh mục</Link>
          <Link to="/category/iphone" className="hover:text-red-600">iPhone</Link>
          <Link to="/category/macbook" className="hover:text-red-600">Macbook</Link>
          <Link to="/category/ipad" className="hover:text-red-600">iPad</Link>
          <Link to="/category/watch" className="hover:text-red-600">Apple Watch</Link>
          <Link to="/category/accessories" className="hover:text-red-600">Phụ kiện</Link>
          <Link to="/contact" className="hover:text-red-600">Liên hệ</Link>
        </div>
      </nav>
    </header>
  );
};

export default ClientHeader;
