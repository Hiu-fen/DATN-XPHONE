import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../../../interface/user';

const UserMenu = () => {
  const [user, setUser] = useState<User | null>(null);
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    message.success("Đăng xuất thành công");
    nav("/login");
  };

  // Định nghĩa menu items cho dropdown
  const menuItems: MenuProps['items'] = !user ? [
    {
      key: 'register',
      label: <Link to="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">Đăng ký</Link>,
    },
    {
      key: 'login',
      label: <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">Đăng nhập</Link>,
    }
  ] : [
    {
      key: 'account', // Sửa key để không trùng
      label: (
        <button
          onClick={() => nav('/accounts')}
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          Thông tin tài khoản
        </button>
      ),
    },
    {
      key: 'logout',
      label: (
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-red-600 transition-colors duration-200"
        >
          Đăng xuất
        </button>
      ),
    }
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
      arrow
      overlayClassName="rounded-lg shadow-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 min-w-[150px]"
    >
      <Button
        type="text"
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg px-3 py-2"
        onClick={e => e.preventDefault()}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-green-500 dark:border-green-400"
            onError={(e) => {
              e.currentTarget.src = '/path/to/fallback-avatar.png'; // Fallback avatar
            }}
          />
        ) : (
          <div className="bg-green-100 dark:bg-green-900 w-10 h-10 rounded-full flex items-center justify-center text-green-600 dark:text-green-300">
            <UserOutlined style={{ fontSize: 20 }} />
          </div>
        )}
        <span
          className="hidden md:inline-block font-semibold text-[15px] text-gray-800 dark:text-gray-200"
        >
          Xin chào {user?.name || user?.email || "Khách"}
        </span>
      </Button>
    </Dropdown>
  );
};

export default UserMenu;