import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AccountSiba = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    {
      key: 'user-manage',
      label: 'Quản lý tài khoản',
      icon: <UserOutlined />,
      path: '/accounts/account',
    },
    {
      key: 'register-admin',
      label: 'Đăng ký tài khoản admin',
      icon: <PlusOutlined />,
      path: '/accounts/addaccountadmin',
    },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  const handleClick = (path?: string) => {
    if (typeof path === 'string') {
      if (path === pathname) {
        navigate(path, { state: { forceReload: Date.now() } });
      } else {
        navigate(path);
      }
    }
  };

  return (
    <aside className="w-60 p-5 border-r bg-white rounded-l-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold text-pink-500">Quản lý</h2>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`px-4 py-2 flex items-center gap-3 cursor-pointer rounded transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-pink-100 text-pink-600 font-semibold border-l-4 border-pink-500'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleClick(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AccountSiba;
