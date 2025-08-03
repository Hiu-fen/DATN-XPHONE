import React, { useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { IRam, IVariantCategory } from '../../../../interface/variant';

const RamEdit: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Lấy chi tiết RAM
  const { data: ram, isLoading: isLoadingRam, error: ramError } = useQuery<IRam>({
    queryKey: ['ram', id],
    queryFn: () => axios.get(`http://localhost:5000/api/rams/${id}`).then(res => res.data),
    enabled: !!id,
    retry: 1,
  });

  // Lấy danh sách danh mục biến thể
  const { data: variantCategories = [], isLoading: isLoadingVariantCategories, error: variantCategoriesError } = useQuery<IVariantCategory[]>({
    queryKey: ['variantCategories'],
    queryFn: () => axios.get('http://localhost:5000/api/variant-category').then(res => res.data),
    retry: 1,
  });

  // Cập nhật RAM
  const updateRamMutation = useMutation({
    mutationFn: (values: { size: string; variantCategory: string[] }) => {
      console.log('Payload gửi đi:', values); // Debug payload
      return axios.put(`http://localhost:5000/api/rams/${id}`, values);
    },
    onSuccess: () => {
      message.success('Cập nhật RAM thành công');
      navigate('/admin/variant/list');
    },
    onError: (error: any) => {
      message.error(`Cập nhật RAM thất bại: ${error.response?.data?.message || error.message}`);
    },
  });

  // Điền dữ liệu vào form khi lấy được chi tiết RAM
  useEffect(() => {
    if (ram) {
      console.log('Dữ liệu RAM (full):', ram);
      const variantCategoryArray = Array.isArray(ram.variantCategory)
        ? ram.variantCategory
            .filter(item => (typeof item === 'string' && item) || (typeof item === 'object' && item._id && typeof item._id === 'string'))
            .map(item => (typeof item === 'string' ? item : item._id))
        : [];
      console.log('variantCategoryArray:', variantCategoryArray);
      form.setFieldsValue({
        size: ram.size || '',
        variantCategory: variantCategoryArray,
      });
    }
  }, [ram, form]);

  const onFinish = (values: { size: string; variantCategory: string[] }) => {
    updateRamMutation.mutate(values);
  };

  // Xử lý lỗi tải dữ liệu
  if (!id) {
    return <div style={{ padding: '20px' }}>ID không hợp lệ</div>;
  }
  if (isLoadingRam || isLoadingVariantCategories) {
    return <div style={{ padding: '20px' }}>Đang tải...</div>;
  }
  if (ramError) {
    return <div style={{ padding: '20px', color: 'red' }}>Lỗi tải RAM: {ramError.message}</div>;
  }
  if (variantCategoriesError) {
    return <div style={{ padding: '20px', color: 'red' }}>Lỗi tải danh mục biến thể: {variantCategoriesError.message}</div>;
  }

  // Kiểm tra nếu không có danh mục biến thể
  const validCategories = variantCategories.filter((category) => category._id && typeof category._id === 'string' && category.name);
  if (validCategories.length === 0) {
    return <div style={{ padding: '20px', color: 'red' }}>Không có danh mục biến thể để hiển thị</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Chỉnh sửa RAM</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Kích thước RAM"
          name="size"
          rules={[{ required: true, message: 'Vui lòng nhập kích thước RAM' }]}
        >
          <Input placeholder="Nhập kích thước RAM (ví dụ: 8GB)" />
        </Form.Item>
        <Form.Item
          label="Danh mục biến thể"
          name="variantCategory"
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một danh mục biến thể' }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn danh mục biến thể"
            loading={isLoadingVariantCategories}
            allowClear
            value={form.getFieldValue('variantCategory')}
          >
            {validCategories.map((category) => (
              <Select.Option key={category._id} value={category._id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={updateRamMutation.isPending}>
            Cập nhật RAM
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

export default RamEdit;