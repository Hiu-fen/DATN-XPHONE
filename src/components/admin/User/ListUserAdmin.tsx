import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, message, Popconfirm, Table, Tag } from 'antd';
import axios from 'axios';
import React from 'react';
import { User } from '../../../interface/user';
import { useNavigate } from 'react-router-dom';

const GetAdmin = () => {
  const nav = useNavigate();

  // Lấy danh sách user
  const { data: users, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await axios.get(`http://localhost:4000/users`)).data,
  });

  // Mutation để cập nhật trạng thái active
const updateStatus = useMutation({
  mutationFn: async ({ user, status }: { user: User; status: boolean }) => {
    return await axios.patch(`http://localhost:4000/users/${user.id}`, {
      active: status,
    });
  },
  onSuccess: (data, variables) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    if (
      variables.status === false &&
      currentUser &&
      currentUser.id === variables.user.id
    ) {
      message.error("Tài khoản của bạn đã bị tạm dừng");
localStorage.removeItem("user");
nav("/admin/login"); // 
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
          src={record.avatar}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />

      )
     
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

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Danh sách người dùng</h1>
      <Table
        dataSource={users?.filter((user: User) => user.role === 'admin')}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default GetAdmin;
