import { FaBars, FaHeart, FaBell, FaShoppingCart, FaHistory } from 'react-icons/fa';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Dropdown } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getUserUnreadCount } from '../../../../api/client/nofitationApiClient';

const HamburgerMenu = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?._id;

  const { data } = useQuery({
    queryKey: ['unread-count', userId],
    queryFn: () => getUserUnreadCount(userId!),
    enabled: !!userId,
    refetchInterval: 30000, 
  });

  const unreadCount = data?.data?.count ?? 0;

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
          <Link to="/notification" className="flex items-center gap-2 relative">
            <Badge count={unreadCount > 9 ? '9+' : unreadCount} size="small" offset={[6, -4]}>
              <FaBell className="text-base" />
            </Badge>
            <span>Thông báo</span>
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
         <Link to="/history" className="flex items-center gap-2">
          <FaHistory /> <span>Lịch sử mua hàng</span>
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
        placement='bottomRight'
        popupRender={(menuNode) => (
          <div className="min-w-[200px] bg-white rounded-md shadow-lg">
            {menuNode}
          </div>
        )}
      >
        <Badge dot={unreadCount > 0} offset={[-4, 5]}>
          <Button type="text" icon={<FaBars className="text-2xl" />} />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default HamburgerMenu
