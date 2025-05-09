import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, message, Popconfirm, Table } from 'antd'
import axios from 'axios'
import React from 'react'
import { User } from '../../interface/user'
import { useNavigate } from 'react-router-dom'

{/* <h2>hehehe</h2>add */}
const GetUser = () => {
  const nav = useNavigate();

  const { data: users, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await axios.get(`http://localhost:4000/users`)).data
  });



  const columns = [
    {
      title: "STT",
      key: 'stt',
      render: (_: any, __: User, index: number) => index + 1
    },
    {
      title: "Email",
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: "Mật khẩu",
      key: 'password',
      render: (_: any, record: User) => {
        const length = record.password?.length || 0;
        const stars = '*'.repeat(length > 10 ? 10 : length);
        return <span>{stars}</span>;
      }
    },
    {
        title: "Số điện thoại",
        key: 'Số điẹn thoại',
        render: (_: any, record: User) => {
          const phone = record.sdt || "";
          if (phone.length >= 6) {
            const hidden = "*".repeat(6);
            const visible = phone.slice(0, phone.length - 6);
            return visible + hidden;
          }
          return "*".repeat(phone.length); // nếu ngắn hơn 6 số
        }
      },
    {
      title: "Địa chỉ",
      key: 'address',
      render: (_: any, record: User) => record.address || "Chưa có"
    },
    
  ];

  return (
    <div>
      <h1>Danh sách người dùng</h1>
      <Table dataSource={users} columns={columns} rowKey="id" />
    </div>
  );
}

export default GetUser;
