import {
  BarChartOutlined,
  CommentOutlined,
  DatabaseOutlined,
  GiftOutlined,
  PhoneOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['product-manage']);

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Thống kê',
      icon: <BarChartOutlined />,
      path: '/admin'
    },
    {
      key: 'product-manage',
      label: 'Quản lý sản phẩm',
      icon: <ShoppingOutlined />,
      children: [
        { key: 'product-list', label: 'Danh sách sản phẩm', path: '/admin/phone/list' },
        { key: 'product-add', label: 'Thêm sản phẩm', path: '/admin/phone/add' }
      ]
    },
    {
      key: 'category-manage',
      label: 'Quản lý danh mục',
      icon: <DatabaseOutlined />,
      children: [
        { key: 'category-list', label: 'Danh mục', path: '/admin/category/list' },
        { key: 'category-add', label: 'Thêm danh mục', path: '/admin/category/add' }
      ]
    },
    {
      key: 'comment-manage',
      label: 'Quản lý bình luận',
      icon: <CommentOutlined />,
      children: [
        { key: 'comment-list', label: 'Bình luận', path: '/admin/comment/list' },
        { key: 'comment-add', label: 'Thêm bình luận', path: '/admin/comment/add' }
      ]
    },
    {
      key: 'user',
      label: 'Quản lý tài khoản',
      icon: <UserOutlined />,
      children: [
        { key: 'user/list', label: 'Tài khoản', path: '/admin/user/list' }
      ]
    },
    {
      key: 'banner',
      label: 'Quản lý Banner',
      icon: <PictureOutlined />,
      children: [
        { key: 'banner/list', label: 'Banner', path: '/admin/banner/list' }
      ]
    },
    {
      key: 'phone',
      label: 'Quản lý liên hệ',
      icon: <PhoneOutlined />,
      children: [
         { key: 'contact/list', label: 'Liên hệ', path: '/admin/contact/list' },
        { key: 'contact/add', label: 'Thêm mới liên hệ', path: '/admin/contact/add' }
      ]
    },
    {
      key: 'order',
      label: 'Quản lý đơn hàng',
      icon: <ShoppingCartOutlined />,
      children: [
        { key: 'order/list', label: 'Đơn hàng', path: '/admin/order/list' }
      ]
    },
    {
      key: 'promotion',
      label: 'Quản lý khuyến mãi',
      icon: <GiftOutlined />,
      children: [
        { key: 'promotion/list', label: 'Khuyến mãi', path: '/admin/promotion/list' }
      ]
    }
  ];

  const handleClick = (key: any, path: any) => {
    setActiveMenu(key);
    if (path) {
      navigate(path);
    }
  };

  const toggleSubMenu = (key: any) => {
    if (expandedMenus.includes(key)) {
      setExpandedMenus(expandedMenus.filter(item => item !== key));
    } else {
      setExpandedMenus([...expandedMenus, key]);
    }
  };

  return (
    <aside className="w-1/5 min-w-[280px] h-screen bg-green-700 overflow-y-auto sticky top-0 left-0">
      {/* Menu Items */}
      <nav className="py-4">
        {menuItems.map(item => (
          <div key={item.key} className="mb-1">
            {/* Menu Item with children */}
            {item.children ? (
              <>
                <div
                  className={`px-6 py-3 flex items-center justify-between cursor-pointer ${activeMenu === item.key
                    ? 'bg-green-800 text-white'
                    : 'text-green-100 hover:bg-green-600'
                    }`}
                  onClick={() => toggleSubMenu(item.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className={`transform transition-transform ${expandedMenus.includes(item.key) ? 'rotate-90' : ''
                    }`}>
                    ›
                  </span>
                </div>

                {/* SubMenu Items */}
                {expandedMenus.includes(item.key) && (
                  <div className="bg-green-800 py-1">
                    {item.children.map(child => (
                      <div
                        key={child.key}
                        className={`pl-14 pr-6 py-2 cursor-pointer ${activeMenu === child.key
                          ? 'bg-green-900 text-white border-l-2 border-white'
                          : 'text-green-200 hover:bg-green-700'
                          }`}
                        onClick={() => handleClick(child.key, child.path)}
                      >
                        <span className="text-sm">{child.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Single Menu Item
              <div
                className={`px-6 py-3 flex items-center gap-3 cursor-pointer ${activeMenu === item.key
                  ? 'bg-green-800 text-white border-l-2 border-white'
                  : 'text-green-100 hover:bg-green-600'
                  }`}
                onClick={() => handleClick(item.key, item.path)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;