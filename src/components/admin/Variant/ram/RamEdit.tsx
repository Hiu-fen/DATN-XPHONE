import React, { useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { IRam, IVariantCategory } from '../../../../interface/variant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const RamEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, reset } = useForm<IRam>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy chi tiết RAM
  const { data: ram, isLoading: isLoadingRam, error: ramError } = useQuery<IRam>({
    queryKey: ['rams', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/rams/${id}`);
      console.log('Data RAM:', res.data); // Debug dữ liệu RAM
      return res.data;
    },
    enabled: !!id,
  });

  // Lấy danh sách danh mục biến thể
  const { data: variantCategories = [], isLoading: isLoadingVariantCategories, error: variantCategoriesError } = useQuery<IVariantCategory[]>({
    queryKey: ['variantCategories'],
    queryFn: () => axios.get('http://localhost:5000/api/variant-category').then(res => res.data),
  });

  // Cập nhật RAM
  const updateRamMutation = useMutation({
    mutationFn: (values: IRam) => {
      console.log('Payload cập nhật:', values); // Debug payload
      return axios.put(`http://localhost:5000/api/rams/${id}`, values);
    },
    onSuccess: () => {
      message.success('Cập nhật RAM thành công');
      queryClient.invalidateQueries({ queryKey: ['rams'] });
      navigate('/admin/variant/list');
    },
    onError: (error: any) => {
      message.error(`Cập nhật RAM thất bại: ${error.response?.data?.message || error.message}`);
    },
  });

  // Điền dữ liệu vào form
  useEffect(() => {
    if (ram) {
      reset({
        size: ram.size,
        variantCategory: ram.variantCategory,
      });
    }
  }, [ram, reset]);

  const onSubmit = (values: IRam) => {
    updateRamMutation.mutate(values);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Chỉnh sửa RAM</h2>
      {ramError && <p style={{ color: 'red' }}>Lỗi tải RAM: {ramError.message}</p>}
      {variantCategoriesError && (
        <p style={{ color: 'red' }}>Lỗi tải danh mục biến thể: {variantCategoriesError.message}</p>
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Dung lượng (VD: 4GB)" required>
          <Controller
            name="size"
            control={control}
            rules={{ required: 'Không được để trống' }}
            render={({ field }) => <Input {...field} placeholder="Nhập dung lượng" disabled={isLoadingRam} />}
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
                disabled={isLoadingRam}
                onChange={(value) => field.onChange(value)}
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
          <Button type="primary" htmlType="submit" loading={updateRamMutation.isPending}>
            Cập nhật
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