import React, { useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { IColor, IVariantCategory } from '../../../../interface/variant';

const ColorEdit: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Lấy chi tiết màu
  const { data: color, isLoading: isLoadingColor } = useQuery<IColor>({
    queryKey: ['color', id],
    queryFn: () => axios.get(`http://localhost:5000/api/colors/${id}`).then(res => res.data),
  });

  // Lấy danh sách danh mục biến thể
  const { data: variantCategories = [], isLoading: isLoadingVariantCategories } = useQuery<IVariantCategory[]>({
    queryKey: ['variantCategories'],
    queryFn: () => axios.get('http://localhost:5000/api/variant-category').then(res => res.data),
  });

  // Cập nhật màu
  const updateColorMutation = useMutation({
    mutationFn: (values: { name: string; variantCategory: string }) =>
      axios.put(`http://localhost:5000/api/colors/${id}`, values),
    onSuccess: () => {
      message.success('Cập nhật màu thành công');
      navigate('/admin/variant/list');
    },
    onError: (error: any) => {
      message.error(`Cập nhật màu thất bại: ${error.response?.data?.message || error.message}`);
    },
  });

  // Điền dữ liệu vào form khi lấy được chi tiết màu
  useEffect(() => {
    if (color) {
      form.setFieldsValue({
        name: color.name,
        variantCategory: color.variantCategory,
      });
    }
  }, [color, form]);

  const onFinish = (values: { name: string; variantCategory: string }) => {
    updateColorMutation.mutate(values);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Chỉnh sửa màu</h2>
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
          <Button type="primary" htmlType="submit" loading={updateColorMutation.isPending}>
            Cập nhật màu
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

export default ColorEdit;