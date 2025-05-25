import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  MenuOutlined,
  HomeOutlined,
  SettingOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { NotificationItem } from '../utils/notification';


export default function XPhoneHeader() {
  const [notificationCount] = useState(3);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const nav = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);



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
    nav("/admin/login");
  };

  const toggleNotification = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-50 sticky top-0">
      {/* Logo */}
      <div className="flex items-center ml-8">
        <Link to="/admin" className="font-bold text-Chartreuse-600 text-2xl flex items-center">
          <span className="text-green-600">X</span>Phone
          <span className="text-green-600 ml-1">.</span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        <div className="hidden md:flex items-center gap-4">
          <Link to="/">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <HomeOutlined className="text-gray-600" style={{ fontSize: 20 }} />
            </button>
          </Link>

        </div>





        {/* Settings */}
        <Link to="#">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <SettingOutlined className="text-gray-600" style={{ fontSize: 20 }} />
          </button>
        </Link>

        {/* Mobile Menu */}
        <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MenuOutlined className="text-gray-600" style={{ fontSize: 22 }} />
        </button>

        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

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
                Xin chào {user?.name || user?.email || "Admin"}
              </p>
            </div>
          </div>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
              {!user ? (
                <>
                  <Link
                    to="/admin/register"
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
                  <Link
                    to="/admin/user/profileadmin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
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
    </header>
  );
}
