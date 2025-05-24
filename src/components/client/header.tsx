import { FaShoppingCart, FaUser, FaBell, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ClientHeader = () => {
  return (
    <header className="bg-white shadow">

      {/* Phần trên: Logo, Tìm kiếm, Icon */}
      <div className="w-full bg-white sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between py-3 px-4 gap-3 sm:gap-0">

          {/* Logo */}
          <div className="w-full sm:w-auto text-center sm:text-left">
            <Link to="/" className="text-2xl sm:text-3xl font-bold text-red-600">XPhone</Link>
          </div>

          {/* Tìm kiếm */}
          <div className="w-full sm:flex-1 sm:px-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full border p-2 rounded max-w-full sm:max-w-lg"
            />
          </div>

          {/* Icon */}
          <div className="w-full sm:w-auto flex justify-around sm:justify-end gap-4 sm:gap-6 text-sm sm:text-base text-gray-600 mt-2 sm:mt-0">
            <Link to="/wishlist" className="hover:text-red-500 flex flex-col items-center">
              <FaHeart className="text-lg sm:text-xl" />
              <span className="text-xs">Yêu thích</span>
            </Link>
            <Link to="/notifications" className="hover:text-red-500 flex flex-col items-center">
              <FaBell className="text-lg sm:text-xl" />
              <span className="text-xs">Thông báo</span>
            </Link>
            <Link to="/cart" className="hover:text-red-500 flex flex-col items-center">
              <FaShoppingCart className="text-lg sm:text-xl" />
              <span className="text-xs">Giỏ hàng</span>
            </Link>
            <Link to="/account" className="hover:text-red-500 flex flex-col items-center">
              <FaUser className="text-lg sm:text-xl" />
              <span className="text-xs">Tài khoản</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu ngang */}
      <nav className="bg-gray-100 border-t overflow-x-auto justify-center  pl-0 w-full">
        <div className="max-w-7xl mx-auto flex gap-4 sm:gap-6 px-4 py-2 text-gray-700 font-medium items-center whitespace-nowrap text-sm sm:text-base">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <Link to="/about" className="hover:text-red-600">Giới thiệu</Link>
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
