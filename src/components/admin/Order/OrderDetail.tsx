import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, Descriptions, Table, Typography, Divider } from 'antd';

const { Title } = Typography;

const OrderDetail = () => {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:4000/orders/${id}`);
      return res.data;
    }
  });

  const shippingFee = 35000; // Phí vận chuyển mặc định 35k

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString() + '₫',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, record: any) =>
        (record.quantity * record.price).toLocaleString() + '₫',
    },
  ];

  if (isLoading) return <p>Đang tải...</p>;

  // Tính tổng tiền hàng (đã có trong order.total, nhưng tính lại để chắc chắn)
  const totalItemsPrice = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  // Tổng thanh toán = tiền hàng + phí vận chuyển
  const totalPayment = totalItemsPrice + shippingFee;

  return (
    <div>
      <Title level={3}>Chi tiết đơn hàng #{order.orderCode}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1} size="middle" title="Thông tin người nhận">
          <Descriptions.Item label="Họ tên">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{order.phone}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng">{order.address}</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">
            {new Date(order.date).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái đơn hàng">
            {order.status}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Sản phẩm đã đặt">
        <Table
          dataSource={order.items}
          columns={columns}
          rowKey={(item) => item.productId}
          pagination={false}
        />
        <Divider />
        <div style={{ textAlign: 'right', fontSize: '16px' }}>
          <p>
            <b>Tạm tính:</b> {totalItemsPrice.toLocaleString()}₫
          </p>
          <p>
            <b>Phí vận chuyển:</b> {shippingFee.toLocaleString()}₫
          </p>
          <p>
            <b>Tổng thanh toán:</b>{' '}
            <span style={{ color: '#e53935' }}>{totalPayment.toLocaleString()}₫</span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetail;
