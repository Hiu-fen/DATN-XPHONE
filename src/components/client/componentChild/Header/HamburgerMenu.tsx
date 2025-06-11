import { FaBars, FaHeart, FaBell, FaShoppingCart, FaHistory } from 'react-icons/fa';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown } from 'antd';

const HamburgerMenu = ({ userId }: { userId?: string }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menu = {
    items: [
      {
        key: 'wishlist',
        label: (
          <Link to="/wishlist" className="flex items-center gap-2 hover:text-red-500">
            <FaHeart /> <span>Yêu thích</span>
          </Link>
        ),
      },
      {
        key: 'notifications',
        label: (
          <Link to="/notification" className="flex items-center gap-2">
            <FaBell /> <span>Thông báo</span>
          </Link>
        ),
      },
      {
        key: 'cart',
        label: (
          <Link to={`/cart/${userId}`} className="flex items-center gap-2">
            <FaShoppingCart /> <span>Giỏ hàng</span>
          </Link>
        ),
      },
      {
        key: 'history',
        label: (
          <Link to="#" className="flex items-center gap-2">
            <FaHistory  /> <span>Lịch sử mua hàng</span>
          </Link>
        ),
      },
    ],
  };

  return (
    <div ref={dropdownRef}>
      <Dropdown
        menu={menu}
        trigger={['click']}
        placement="bottomRight"
        popupRender={menuNode => (
          <div className="min-w-[200px] bg-white rounded-md shadow-lg">
            {menuNode}
          </div>
        )}
      >
        <Button type="text" icon={<FaBars className="text-2xl" />} />
      </Dropdown>
    </div>
  );
};

export default HamburgerMenu
