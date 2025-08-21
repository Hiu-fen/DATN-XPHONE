import { Link } from 'react-router-dom';
import {
  HomeOutlined,
  MenuOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tooltip, Dropdown } from 'antd';

export default function NavIcons() {
  // Menu cho Setting Dropdown
  const settingMenu = {
    items: [
      {
        key: 'notifications',
        label: (
          <Link
            to="/admin/SetNotification"
            className="block px-3 py-1 hover:text-blue-500"
          >
            Quản lý thông báo
          </Link>
        ),
      },
      // {
      //   key: 'general',
      //   label: (
      //     <Link
      //       to="#"
      //       className="block px-3 py-1 hover:text-blue-500"
      //     >
      //       Cài đặt chung
      //     </Link>
      //   ),
      // },
    ],
  };

  return (
    <>
      {/* 🏠 Link về trang chủ */}
      <div className="hidden md:flex items-center gap-4">
        <Link to="/">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Tooltip title="Về trang chủ">
              <HomeOutlined className="text-gray-600 text-[20px]" />
            </Tooltip>
          </button>
        </Link>
      </div>

      {/* ⚙️ Setting Dropdown */}
      <Dropdown menu={settingMenu} placement="bottomRight" arrow trigger={['click']}>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <SettingOutlined className="text-gray-600 text-[20px]" />
        </button>
      </Dropdown>

      {/* ☰ Menu cho mobile */}
      <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
        <MenuOutlined className="text-gray-600 text-[22px]" />
      </button>
    </>
  );
}
