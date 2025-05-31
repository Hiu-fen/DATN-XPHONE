import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, message, Popconfirm, Table, Tag } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { User } from '../../../interface/user';
import { useNavigate } from 'react-router-dom';

const GetAdmin = () => {
  const nav = useNavigate();
  const [searchText, setSearchText] = useState('');

  // ✅ Lấy danh sách admin từ MongoDB
  const { data: users, refetch } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => (await axios.get(`http://localhost:5000/api/users/admins`)).data,
  });

  // ✅ Mutation để cập nhật trạng thái active
  const updateStatus = useMutation({
    mutationFn: async ({ user, status }: { user: any; status: boolean }) => {
      return await axios.patch(`http://localhost:5000/api/users/${user._id}`, {
        active: status,
      });
    },
    onSuccess: (data, variables) => {
      const currentUser = JSON.parse(localStorage.getItem("admin") || "null");

      if (
        variables.status === false &&
        currentUser &&
        currentUser._id === variables.user._id
      ) {
        message.error("Tài khoản của bạn đã bị tạm dừng");
        localStorage.removeItem("admin");
        localStorage.removeItem("token"); // Nếu dùng token
        nav("/admin/login");
      }

      message.success(
        variables.status
          ? 'Mở lại tài khoản thành công'
          : 'Tạm dừng tài khoản thành công'
      );
      refetch();
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi cập nhật tài khoản');
    },
  });

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: User, index: number) => index + 1,
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: 'Ảnh đại diện',
      key: 'avatar',
      render: (_: any, record: User) => (
        <img
          src={record.avatar || 'https://via.placeholder.com/40'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    {
      title: 'Số điện thoại',
      key: 'sdt',
      render: (_: any, record: User) => {
        const phone = record.sdt || '';
        if (phone.length >= 6) {
          const hidden = '*'.repeat(6);
          const visible = phone.slice(0, phone.length - 6);
          return visible + hidden;
        }
        return '*'.repeat(phone.length);
      },
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (_: any, record: User) => record.address || 'Chưa có',
    },
    {
      title: 'Trạng thái',
      key: 'active',
      render: (_: any, record: User) =>
        record.active !== false ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Bị tạm dừng</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) =>
        record.active !== false ? (
          <Popconfirm
            title="Bạn có chắc muốn tạm dừng tài khoản này không?"
            onConfirm={() => updateStatus.mutate({ user: record, status: false })}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Tạm dừng</Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Bạn có chắc muốn mở lại tài khoản này không?"
            onConfirm={() => updateStatus.mutate({ user: record, status: true })}
            okText="Mở lại"
            cancelText="Hủy"
          >
            <Button type="primary" ghost>Mở lại</Button>
          </Popconfirm>
        ),
    },
  ];

  const search = users
    ?.filter((user: User) => user.role === 'admin')
    ?.filter((u: User) => {
      const text = `${u._id} ${u.email} ${u.address ?? ''} ${u.sdt ?? ''}`.toLowerCase();
      return text.includes(searchText.toLowerCase());
    });

  return (
    <div>
      <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
          placeholder="Tìm kiếm theo email, địa chỉ, số điện thoại..."
          className="mb-4"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      <Table
        dataSource={search}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          pageSizeOptions: ['5', '10', '20'],
        }}
      />
    </div>
  );
};

export default GetAdmin;
