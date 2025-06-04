import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button, Form, Input, message, Select, Spin, Table } from 'antd';

interface OrderItem {
  productId: string;
  productName: string;
  soluong: number;
  price: number;
}

interface IProduct {
  _id: string;
  name: string;
  price: number;
  soluong: number;
  image: string;
}

const PlaceOrder = () => {
  const [form] = Form.useForm();
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Lấy danh sách sản phẩm
  const { data: products, isLoading } = useQuery<IProduct[]>({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/products')).data,
  });

  // Mutation tạo đơn hàng
  const mutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await axios.post('http://localhost:5000/api/orders', orderData);
    },
    onSuccess: () => {
      message.success('Đặt hàng thành công!');
      form.resetFields();
      setCart([]);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Lỗi khi đặt hàng');
    },
  });

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product: IProduct, soluong: number) => {
    const existingItem = cart.find((item) => item.productId === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, soluong: item.soluong + soluong }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          productName: product.name,
          soluong,
          price: product.price,
        },
      ]);
    }
  };

  // Xử lý submit form
  const onFinish = (values: any) => {
    if (cart.length === 0) {
      message.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.soluong, 0) + 35000; // Phí vận chuyển cố định

    const orderData = {
      customerName: values.customerName,
      phone: values.phone,
      address: values.address,
      items: cart,
      total,
      paymentMethod: values.paymentMethod,
      shippingProvider: values.shippingProvider,
      notes: values.notes,
    };

    mutation.mutate(orderData);
  };

  // Cột bảng giỏ hàng
  const columns = [
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Số lượng', dataIndex: 'soluong', key: 'soluong' },
    {
      title: 'Giá', dataIndex: 'price', key: 'price',
      render: (price: number) => price.toLocaleString() + ' VND',
    },
    {
      title: 'Thành tiền', key: 'total',
      render: (_: any, record: OrderItem) => (record.soluong * record.price).toLocaleString() + ' VND',
    },
  ];

  if (isLoading) return <Spin tip="Đang tải sản phẩm..." />;

  return (
    <div>
      <h2>Đặt hàng</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="customerName"
          label="Họ tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="paymentMethod" label="Phương thức thanh toán">
          <Select>
            <Select.Option value="cod">Thanh toán khi nhận hàng</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="shippingProvider" label="Đơn vị vận chuyển">
          <Select>
            <Select.Option value="ghn">Giao Hàng Nhanh</Select.Option>
            <Select.Option value="ghtk">Giao Hàng Tiết Kiệm</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="notes" label="Ghi chú">
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
            Đặt hàng
          </Button>
        </Form.Item>
      </Form>

      <h3>Giỏ hàng</h3>
      <Table dataSource={cart} columns={columns} rowKey="productId" pagination={false} />

      <h3>Chọn sản phẩm</h3>
      {products?.map((product) => (
        <div key={product._id} style={{ marginBottom: 10 }}>
          <span>{product.name} - {product.price.toLocaleString()} VND (Tồn: {product.soluong})</span>
          <Button onClick={() => addToCart(product, 1)} style={{ marginLeft: 10 }}>
            Thêm
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PlaceOrder;
