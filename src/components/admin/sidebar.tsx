import {
  BarChartOutlined,
  CommentOutlined,
  DashboardFilled,
  DatabaseOutlined,
  GiftOutlined,
  PhoneOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
// import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  type MenuItem = Required<MenuProps>['items'][number];
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardFilled />,
    },
    {
      key: 'product-manage',
      label: 'Quản lý sản phẩm',
      icon: <ShoppingOutlined />,
      children: [
        { key: 'product-list', label: 'Danh sách sản phẩm' },
        { key: 'product-add', label: 'Thêm sản phẩm' },
      ],
    },
    {
      key: 'category-manage',
      label: 'Quản lý danh mục',
      icon: <DatabaseOutlined />,
      children: [
        { key: 'category-list', label: 'Danh mục' },
        { key: 'category-add', label: 'Thêm danh mục' },
      ],
    },
    {
      key: 'comment-manage',
      label: 'Quản lý bình luận',
      icon: <CommentOutlined />,
      children: [
        { key: 'comment-list', label: 'Bình luận' },
        { key: 'comment-add', label: 'Thêm bình luận' },
      ],
    },
    {
      key: 'user',
      label: 'Quản lý tài khoản',
      icon: <UserOutlined />,
      children: [
        { key: 'user/list', label: 'Tài khoản' },
      ],
    },
    {
      key: 'banner',
      label: 'Quản lý Banner',
      icon: <PictureOutlined />,
      children: [
        { key: 'user/list', label: 'Banner' },
      ],
    },
    {
      key: 'phone',
      label: 'Quản lý liên hệ',
      icon: <PhoneOutlined />,
      children: [
        { key: 'user/list', label: 'Liên hệ' },
      ],
    },
    {
      key: 'Don hang',
      label: 'Quản lý đơn hàng',
      icon: <ShoppingCartOutlined />,
      children: [
        { key: 'user/list', label: 'Đơn hàng' },
      ],
    },
    {
      key: 'Khuyen mai',
      label: 'Quản lý khuyến mãi',
      icon: <GiftOutlined />,
      children: [
        { key: 'user/list', label: 'Khuyến mãi' },
      ],
    },
    {
      key: 'report',
      label: 'Thống kê',
      icon: <BarChartOutlined />,
    },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const routeMap: Record<string, string> = {
      'product-list': '/admin/phone/list',
      'product-add': '/admin/phone/add',
      'category-list': '/admin/category/list',
      'category-add': '/admin/category/add',
      'comment-list': '/admin/comment/list',
      'comment-add': '/admin/comment/add',
      'user/list': '/admin/user/list',
      dashboard: '/admin',
      report: '/admin/report',
    };

    if (routeMap[key]) {
      navigate(routeMap[key]);
    }
  };

  return (
    <div className="w-1/5 h-screen bg-white">
      <Menu
        onClick={onClick}
        style={{ width: '100%' }}
        defaultSelectedKeys={['dashboard']}
        mode="inline"
        items={items}
      />
    </div>
  );
};

export default AdminSidebar;
