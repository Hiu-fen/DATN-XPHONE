import { useEffect, useState } from 'react';
import { UserOutlined, LogoutOutlined, IdcardOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Typography, MenuProps } from 'antd';

const { Text } = Typography;

export default function UserMenu() {
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('admin');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Lỗi parse user:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    setUser(null);
    nav('/admin/login');
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <IdcardOutlined />,
      label: <Link to="/admin/user/profileadmin">Thông tin cá nhân</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <div className="flex items-center gap-3 cursor-pointer">
        <Avatar
          size="large"
          src={user?.avatar}
          icon={!user?.avatar && <UserOutlined />}
          className="border-2 border-green-500"
        />
        <div className="hidden md:block">
          <Text className="font-medium text-gray-800">
            Xin chào {user?.name || user?.email || 'Admin'}
          </Text>
        </div>
      </div>
    </Dropdown>
  );
}
