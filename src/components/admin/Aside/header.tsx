import { Link } from 'react-router-dom';
import NotificationBell from '../ComponentCon/Header/ThongBao';
import NavIcons from '../ComponentCon/Header/NavIcon';
import UserMenu from '../ComponentCon/Header/UserMenu';
import { Typography } from 'antd';
import { MobileOutlined } from '@ant-design/icons';
const { Text } = Typography;

export default function XPhoneHeader() {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-50 sticky top-0">
      
      {/* Logo */}
      <div className="flex items-center ml-4">
        <Link to="/admin" className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <MobileOutlined style={{ fontSize: 28, color: '#52c41a' }} />
          <Text strong className="text-xl text-gray-800">
            <span className="text-green-600">X</span>Phone
          </Text>
        </Link>
      </div>
      
      {/* Thông báo, user, và các biểu tượng điều hướng */}
      <div className="flex items-center gap-5">
        <NavIcons />
        <NotificationBell />
        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
        <UserMenu />
      </div>
    </header>
  );
}
