import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IVariantCategory } from '../../../../interface/variant';

const ColorAdd: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Lấy danh sách danh mục biến thể
  const { data: variantCategories = [], isLoading: isLoadingVariantCategories, error: variantCategoriesError } = useQuery<IVariantCategory[]>({
    queryKey: ['variantCategories'],
    queryFn: () => axios.get('http://localhost:5000/api/variant-category').then(res => res.data),
  });

  // Thêm màu mới
  const addColorMutation = useMutation({
    mutationFn: (values: { name: string; variantCategory: string }) => {
      console.log('Payload gửi đi:', values); // Debug payload
      return axios.post('http://localhost:5000/api/colors', values);
    },
    onSuccess: () => {
      message.success('Thêm màu thành công');
      navigate('/admin/variant/list');
    },
    onError: (error: any) => {
      message.error(`Thêm màu thất bại: ${error.response?.data?.message || error.message}`);
    },
  });

  const onFinish = (values: { name: string; variantCategory: string }) => {
    addColorMutation.mutate(values);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Thêm màu mới</h2>
      {variantCategoriesError && (
        <p style={{ color: 'red' }}>Lỗi tải danh mục biến thể: {variantCategoriesError.message}</p>
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên màu"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên màu' }]}
        >
          <Input placeholder="Nhập tên màu" />
        </Form.Item>
        <Form.Item
          label="Danh mục biến thể"
          name="variantCategory"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục biến thể' }]}
        >
          <Select
            placeholder="Chọn danh mục biến thể"
            loading={isLoadingVariantCategories}
            allowClear
          >
            {variantCategories.map((category) => (
              <Select.Option key={category._id} value={category._id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={addColorMutation.isPending}>
            Thêm màu
          </Button>
          <Button
            style={{ marginLeft: '10px' }}
            onClick={() => navigate('/admin/variant/list')}
          >
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ColorAdd;