import {
  BarChartOutlined,
  BranchesOutlined,
  CommentOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  GiftOutlined,
  PhoneOutlined,
  PictureOutlined,
  ReadOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const { Sider } = Layout;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    {
      key: '/admin',
      icon: <BarChartOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Thống kê</span>,
    },
    {
      key: 'product-manage',
      icon: <ShoppingOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý sản phẩm</span>,
      children: [
        { key: '/admin/phone/list', label: <span className="text-[15px]">Danh sách sản phẩm</span> },
        // { key: '/admin/phone/add', label: <span className="text-[15px]">Thêm sản phẩm</span> },
      ],
    },
    {
      key: 'category-manage',
      icon: <DatabaseOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý danh mục</span>,
      children: [
        { key: '/admin/category/list', label: <span className="text-[15px]">Danh sách danh mục</span> },
        // { key: '/admin/category/add', label: <span className="text-[15px]">Thêm danh mục</span> },
      ],
    },
    {
      key: 'comment-manage',
      icon: <CommentOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý bình luận</span>,
      children: [
        { key: '/admin/comment/list', label: <span className="text-[15px]">Bình luận</span> },
      ],
    },
    {
      key: 'user',
      icon: <UserOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý tài khoản</span>,
      children: [
        { key: '/admin/user/listadmin', label: <span className="text-[15px]">Tài khoản quản trị</span> },
        { key: '/admin/user/listclient', label: <span className="text-[15px]">Tài khoản người dùng</span> },
        
        { key: '/admin/user/history', label: <span className="text-[15px]">Lịch sử cập nhật</span> },
      ],
    },
    {
      key: 'banner',
      icon: <PictureOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý ảnh</span>,
      children: [
        { key: '/admin/banner/list', label: <span className="text-[15px]">Quản lý banner</span> },
      ],
    },
    {
      key: 'contact',
      icon: <PhoneOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý liên hệ</span>,
      children: [
        { key: '/admin/contact/list', label: <span className="text-[15px]">Liên hệ</span> },
      ],
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý đơn hàng</span>,
      children: [{ key: '/admin/orders', label: <span className="text-[15px]">Đơn hàng</span> }],
    },
    {
      key: 'address',
      icon: <FileImageOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý địa chỉ</span>,
      children: [
        { key: '/admin/addresses/list', label: <span className="text-[15px]">Địa chỉ</span> },
        // { key: '/admin/address/add', label: <span className="text-[15px]">Thêm Địa chỉ</span> },
      ],
    },
    {
      key: 'news',
      icon: <ReadOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý tin tức</span>,
      children: [
        { key: '/admin/news/list', label: <span className="text-[15px]">Tin tức</span> },
      ],
    },
    {
      key: 'variant',
      icon: <BranchesOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý Biến thể</span>,
      children: [{ key: '/admin/variant/list', label: <span className="text-[15px]">Biến thể sản phẩm</span> }],
    },
    {
      key: 'promotion',
      icon: <GiftOutlined className="text-xl" />,
      label: <span className="text-[17px] font-semibold">Quản lý khuyến mãi</span>,
      children: [
        { key: '/admin/promotion/list', label: <span className="text-[15px]">Khuyến mãi</span> },
        // { key: '/admin/promotion/add', label: <span className="text-[15px]">Thêm khuyến mãi</span> },
      ],
    },
  ];

  const findOpenKey = () => {
    for (const item of menuItems) {
      if (item.children) {
        if (item.children.some((child) => pathname.startsWith(child.key))) {
          return item.key;
        }
      }
    }
    return '';
  };

  const [openKeys, setOpenKeys] = useState<string[]>([findOpenKey()]);

  const handleClick = ({ key }: { key: string }) => {
    if (key === pathname) {
      navigate(key, { state: { forceReload: Date.now() } });
    } else {
      navigate(key);
    }
  };

  return (
    <Sider
      width={280}
      className="h-screen sticky top-0 left-0 bg-green-700"
      theme="dark"
    >
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys)}
        onClick={handleClick}
        items={menuItems}
        className="bg-green-700 text-white text-[16px]
          [&_.ant-menu-item]:!text-white
          [&_.ant-menu-submenu-title]:!text-white
          [&_.ant-menu-item-selected]:!bg-green-900
          [&_.ant-menu-item-selected]:!text-white
          [&_.ant-menu-item:hover]:!bg-green-600
          [&_.ant-menu-submenu-title:hover]:!bg-green-600
          py-5
          "
      />
    </Sider>
  );
};

export default AdminSidebar;
