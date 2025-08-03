import React from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { IRam, IVariantCategory } from '../../../../interface/variant';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RamAdd: React.FC = () => {
  const { control, handleSubmit } = useForm<IRam>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy danh sách danh mục biến thể
  const { data: variantCategories = [], isLoading: isLoadingVariantCategories, error: variantCategoriesError } = useQuery<IVariantCategory[]>({
    queryKey: ['variantCategories'],
    queryFn: () => axios.get('http://localhost:5000/api/variant-category').then(res => res.data),
  });

  // Thêm RAM mới
  const addRamMutation = useMutation({
    mutationFn: (data: IRam) => {
      console.log('Payload gửi đi:', data); // Debug payload
      return axios.post('http://localhost:5000/api/rams', data);
    },
    onSuccess: () => {
      message.success('Thêm RAM thành công');
      queryClient.invalidateQueries({ queryKey: ['rams'] });
      navigate('/admin/variant/list');
    },
    onError: (error: any) => {
      message.error(`Thêm RAM thất bại: ${error.response?.data?.message || error.message}`);
    },
  });

  const onSubmit = (data: IRam) => {
    addRamMutation.mutate(data);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Thêm RAM mới</h2>
      {variantCategoriesError && (
        <p style={{ color: 'red' }}>Lỗi tải danh mục biến thể: {variantCategoriesError.message}</p>
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Dung lượng (VD: 4GB)" required>
          <Controller
            name="size"
            control={control}
            rules={{ required: 'Không được để trống' }}
            render={({ field }) => <Input {...field} placeholder="Nhập dung lượng" />}
          />
        </Form.Item>
        <Form.Item label="Danh mục biến thể" required>
          <Controller
            name="variantCategory"
            control={control}
            rules={{ required: 'Vui lòng chọn danh mục biến thể' }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Chọn danh mục biến thể"
                loading={isLoadingVariantCategories}
                allowClear
                onChange={(value) => field.onChange(value)} // Cập nhật giá trị form
              >
                {variantCategories.map((category) => (
                  <Select.Option key={category._id} value={category._id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={addRamMutation.isPending}>
            Thêm mới
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

export default RamAdd;