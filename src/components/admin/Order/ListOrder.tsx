import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Table, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
}

const OrderList = () => {
  const navigate = useNavigate();

  const { data: orders, refetch, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:4000/orders');
      return res.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await axios.patch(`http://localhost:4000/orders/${id}`, { status });
    },
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công');
      refetch();
    }
  });

  const handleStatusChange = (id: number, status: string) => {
    mutation.mutate({ id, status });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (_: any, record: Order) => (
        <a
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => navigate(`/admin/order/${record.id}`)}
        >
          {record.orderCode}
        </a>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      render: (_: any, record: Order) => (
        <ul style={{ paddingLeft: 20 }}>
          {record.items.map((item) => (
            <li key={item.productId}>
              {item.productName} x {item.quantity} - {item.price.toLocaleString()} VND
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => total.toLocaleString() + ' VND',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: Order) => (
        <Select
          value={record.status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 150 }}
        >
          <Select.Option value="Chờ xác nhận">Chờ xác nhận</Select.Option>
          <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
          <Select.Option value="Đã giao">Đã giao</Select.Option>
          <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
          <Select.Option value="Đã huỷ">Đã huỷ</Select.Option>
        </Select>
      ),
    },
  ];

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default OrderList;
