import {
  BarChartOutlined,
  CommentOutlined,
  DatabaseOutlined,
  FolderOpenOutlined,
  GiftOutlined,
  PhoneOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Thống kê',
      icon: <BarChartOutlined />,
      path: '/admin',
    },
    {
      key: 'product-manage',
      label: 'Quản lý sản phẩm',
      icon: <ShoppingOutlined />,
      children: [
        { key: 'product-list', label: 'Danh sách sản phẩm', path: '/admin/phone/list' },
        { key: 'product-add', label: 'Thêm sản phẩm', path: '/admin/phone/add' },
      ],
    },
    {
      key: 'category-manage',
      label: 'Quản lý danh mục',
      icon: <DatabaseOutlined />,
      children: [
        { key: 'category-list', label: 'Danh mục', path: '/admin/category/list' },
        { key: 'category-add', label: 'Thêm danh mục', path: '/admin/category/add' },
      ],
    },
    {
      key: 'comment-manage',
      label: 'Quản lý bình luận',
      icon: <CommentOutlined />,
      children: [
        { key: 'comment-list', label: 'Bình luận', path: '/admin/comment/list' },
        { key: 'comment-add', label: 'Thêm bình luận', path: '/admin/comment/add' },
      ],
    },
    {
      key: 'user',
      label: 'Quản lý tài khoản',
      icon: <UserOutlined />,
      children: [
        { key: 'user/listadmin', label: 'Tài khoản quản trị', path: '/admin/user/listadmin' },
        { key: 'user/listclient', label: 'Tài khoản người dùng', path: '/admin/user/listclient' },
      ],
    },
    {
      key: 'banner',
      label: 'Quản lý Banner',
      icon: <PictureOutlined />,
      children: [
        { key: 'banner/list', label: 'Banner', path: '/admin/banner/list' },
        { key: 'banner/add', label: 'Thêm Banner', path: '/admin/banner/add' }

      ],
    },
    {
      key: 'phone',
      label: 'Quản lý liên hệ',
      icon: <PhoneOutlined />,
      children: [
        { key: 'contact/list', label: 'Liên hệ', path: '/admin/contact/list' },
        { key: 'contact/add', label: 'Thêm liên hệ', path: '/admin/contact/add' },
      ],
    },
    {
      key: 'orders',
      label: 'Quản lý đơn hàng',
      icon: <ShoppingCartOutlined />,
      children: [{ key: 'order/list', label: 'Đơn hàng', path: '/admin/orders' }],

    },
    {
      key: 'album',
      label: 'Quản lý Album ảnh',
      icon: <FolderOpenOutlined />,
      children: [
        { key: 'album/list', label: 'Album ảnh', path: '/admin/album/list' },
        { key: 'album-add', label: 'Thêm Album ảnh', path: '/admin/album/add' },
      ],

    },
    
    {
      key: 'promotion',
      label: 'Quản lý khuyến mãi',
      icon: <GiftOutlined />,
      children: [
        { key: 'promotion/list', label: 'Khuyến mãi', path: '/admin/promotion/list' },
        { key: 'promotion/add', label: 'Thêm khuyến mãi', path: '/admin/promotion/add' },
      ],
    },
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  const getExpandedMenus = () => {
    return menuItems
      .filter(item =>
        item.children?.some(child => pathname.startsWith(child.path))
      )
      .map(item => item.key);
  };

  const [openKeys, setOpenKeys] = useState<string[]>(getExpandedMenus());

  const toggleMenu = (key: string) => {
    setOpenKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // ✅ Sửa tại đây: Không reload, dùng state để trigger refetch ở component
  const handleClick = (path?: string) => {
    if (typeof path === 'string') {
      if (path === pathname) {
        // Nếu cùng route thì truyền thêm state mới
        navigate(path, { state: { forceReload: Date.now() } });
      } else {
        navigate(path);
      }
    }
  };

  return (
    <aside className="w-1/5 min-w-[280px] h-screen bg-green-700 overflow-y-auto sticky top-0 left-0">
      <nav className="py-4">
        {menuItems.map((item) => {
          const isExpanded = openKeys.includes(item.key);
          return (
            <div key={item.key} className="mb-1">
              {item.children ? (
                <>
                  <div
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer ${
                      isExpanded ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-600'
                    }`}
                    onClick={() => toggleMenu(item.key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      ›
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="bg-green-800 py-1">
                      {item.children.map((child) => (
                        <div
                          key={child.key}
                          className={`pl-14 pr-6 py-2 cursor-pointer ${
                            isActive(child.path)
                              ? 'bg-green-900 text-white border-l-2 border-white'
                              : 'text-green-200 hover:bg-green-700'
                          }`}
                          onClick={() => handleClick(child.path)}
                        >
                          <span className="text-sm">{child.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`px-6 py-3 flex items-center gap-3 cursor-pointer ${
                    isActive(item.path || '')
                      ? 'bg-green-800 text-white border-l-2 border-white'
                      : 'text-green-100 hover:bg-green-600'
                  }`}
                  onClick={() => handleClick(item.path)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
