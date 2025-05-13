import { useState, useRef } from 'react'; // Đảm bảo import useRef
import { Link } from 'react-router-dom';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  HomeOutlined,
  SettingOutlined,
  GiftOutlined,
} from '@ant-design/icons';

export default function XPhoneHeader() {
  const [notificationCount] = useState(3);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const timeoutRef = useRef(null); // Khai báo timeoutRef bằng useRef

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsUserMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 300); // Đợi 300ms trước khi đóng menu
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-50 sticky top-0">
      {/* Logo & Title */}
      <div className="flex items-center ml-8"> {/* Thêm ml-4 để dịch sang phải 1rem (16px) */}
        <Link to="/admin" className="font-bold text-Chartreuse-600 text-2xl flex items-center">
          <span className="text-green-600">X</span>Phone
          <span className="text-green-600 ml-1">.</span>
        </Link>
      </div>
      {/* Right Section */}
      <div className="flex items-center gap-5">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Bạn muốn tìm kiếm ...?"
            className="w-[600px] px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <HomeOutlined className="text-gray-600" style={{ fontSize: 20 }} />
            </button>
          </Link>
          <Link to="#">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <GiftOutlined className="text-gray-600" style={{ fontSize: 20 }} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">15</span>
            </button>
          </Link>
        </div>
        <div className="relative">
          <Link to="#">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <BellOutlined className="text-gray-600" style={{ fontSize: 20 }} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {notificationCount}
                </span>
              )}
            </button>
          </Link>
        </div>
        <Link to="#">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <SettingOutlined className="text-gray-600" style={{ fontSize: 20 }} />
          </button>
        </Link>
        <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MenuOutlined className="text-gray-600" style={{ fontSize: 22 }} />
        </button>

        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600">
              <UserOutlined style={{ fontSize: 20 }} />
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-800">Xin Chào Admin</p>
            </div>

            {isUserMenuOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}