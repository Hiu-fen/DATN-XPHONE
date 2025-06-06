import { UserOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { FaShoppingCart, FaUser, FaBell, FaHeart, FaBars } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const ClientHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    // const timeoutRef = useRef<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string; _id?:string } | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse user:", error);
      }
    }
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsUserMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsUserMenuOpen(false), 300);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsUserMenuOpen(false);
    nav("/login");
  };  

  return (
    <header className="bg-white shadow">
      {/* Phần trên */}
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

          {/* Hamburger Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:text-red-500 focus:outline-none"
            >
              <FaBars className="text-2xl" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg z-10 p-4 flex flex-col gap-3 text-gray-600 text-sm sm:text-base w-40">
                <Link to="/wishlist" className="hover:text-red-500 flex items-center gap-2">
                  <FaHeart /> Yêu thích
                </Link>
                <Link to="/notifications" className="hover:text-red-500 flex items-center gap-2">
                  <FaBell /> Thông báo
                </Link>
             <Link to={`/cart/${user?._id}`} className="hover:text-red-500 flex items-center gap-2">
              <FaShoppingCart /> Giỏ hàng
            </Link>
                <Link to="/accounts" className="hover:text-red-500 flex items-center gap-2">
                  <FaUser /> Tài khoản
                </Link>
              </div>
            )}
          </div>

          {/* Avatar/User Menu */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-3 cursor-pointer">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-green-500"
                />
              ) : (
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600">
                  <UserOutlined style={{ fontSize: 20 }} />
                </div>
              )}
              <div className="hidden md:block">
                <p className="font-medium text-gray-800">
                  Xin chào {user?.name || user?.email || "Khách"}
                </p>
              </div>
            </div>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                  </>
                ) : (
                  <>
                 
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
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
