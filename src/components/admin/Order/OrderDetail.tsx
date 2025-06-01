  import React from 'react';
  import { useParams } from 'react-router-dom';
  import { useQuery } from '@tanstack/react-query';
  import axios from 'axios';
  import { Card, Descriptions, Table, Typography, Divider, Spin, Alert } from 'antd';

  const { Title } = Typography;

  const OrderDetail = () => {
    const { id } = useParams();

    const { data: order, isLoading, isError } = useQuery({
      queryKey: ['order', id],
      queryFn: async () => {
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
        return res.data;
      },
      enabled: !!id, // chỉ gọi API khi có id
    });

    const shippingFee = 35000;

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
        render: (price: number) => price?.toLocaleString() + '₫',
      },
      {
        title: 'Thành tiền',
        key: 'total',
        render: (_: any, record: any) =>
          (record.quantity * record.price).toLocaleString() + '₫',
      },
    ];

    if (isLoading) return <Spin tip="Đang tải chi tiết đơn hàng..." />;
    if (isError || !order) {
      return <Alert message="Không tìm thấy đơn hàng" type="error" showIcon />;
    }

    const totalItemsPrice = order.items?.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    ) || 0;

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
