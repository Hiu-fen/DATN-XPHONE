import {
  CiOutlined,
  DashboardFilled,
  FileTextFilled,
  HighlightFilled,
  ProductFilled,
  ReadOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import React from 'react';
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
      icon: <ProductFilled />,
      children: [
        { key: 'product-list', label: 'Danh sách sản phẩm' },
        { key: 'product-add', label: 'Thêm sản phẩm' },
      ],
    },
    {
      key: 'category-manage',
      label: 'Quản lý danh mục',
      icon: <HighlightFilled />,
      children: [
        { key: 'category-list', label: 'Danh mục' },
        { key: 'category-add', label: 'Thêm danh mục' },
      ],
    },
    {
      key: 'comment-manage',
      label: 'Quản lý bình luận',
      icon: <ReadOutlined />,
      children: [
        { key: 'comment-list', label: 'Bình luận' },
        { key: 'comment-add', label: 'Thêm bình luận' },
      ],
    },
    {
      key: 'report',
      label: 'Thống kê',
      icon: <FileTextFilled />,
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
