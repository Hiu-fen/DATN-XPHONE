import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, message, Popconfirm, Switch, Table, Tag } from 'antd';
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

  const currentUser = JSON.parse(localStorage.getItem("admin") || "null");

  // ✅ Mutation cập nhật trạng thái active
  const updateStatus = useMutation({
    mutationFn: async ({ user, status }: { user: any; status: boolean }) => {
      return await axios.patch(`http://localhost:5000/api/users/${user._id}`, {
        active: status,
      });
    },
    onSuccess: (data, variables) => {
      if (
        variables.status === false &&
        currentUser &&
        currentUser._id === variables.user._id
      ) {
        message.error("Tài khoản của bạn đã bị tạm dừng");
        localStorage.removeItem("admin");
        localStorage.removeItem("token");
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

  // ✅ Mutation cập nhật role (admin <=> user)
  const updateRole = useMutation({
    mutationFn: async ({ user, role }: { user: User; role: string }) => {
      return await axios.patch(`http://localhost:5000/api/users/${user._id}`, {
        role,
      });
    },
    onSuccess: (_, variables) => {
      message.success(
        variables.role === 'admin'
          ? 'Đã chuyển thành Admin'
          : 'Đã chuyển thành User'
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
      title: 'Tài khoản',
      key: 'role',
      render: (_: any, record: User) => (
        <Switch
          checked={record.role === 'admin'}
          checkedChildren="Admin"
          unCheckedChildren="User"
          onChange={(checked) =>
            updateRole.mutate({
              user: record,
              role: checked ? 'admin' : 'user',
            })
          }
          disabled={record._id === currentUser?._id}
        />
      ),
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
        record._id === currentUser?._id ? null : record.active !== false ? (
          <Popconfirm
            title="Bạn có chắc muốn tạm dừng tài khoản này không?"
            onConfirm={() =>
              updateStatus.mutate({ user: record, status: false })
            }
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Tạm dừng</Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Bạn có chắc muốn mở lại tài khoản này không?"
            onConfirm={() =>
              updateStatus.mutate({ user: record, status: true })
            }
            okText="Mở lại"
            cancelText="Hủy"
          >
            <Button type="primary" ghost>
              Mở lại
            </Button>
          </Popconfirm>
        ),
    },
  ];

  const filteredUsers = users
  ?.filter((user: User) => user.role === 'admin')
  ?.filter((u: User) => {
    const text = `${u._id} ${u.email} ${u.address ?? ''} ${u.sdt ?? ''}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  })
  ?.sort((a: User, b: User) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Mới nhất lên đầu
  });


  return (
    <div>
      <h2 className="text-2xl font-bold">Danh sách quản trị viên</h2>
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
        dataSource={filteredUsers}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default GetAdmin;
