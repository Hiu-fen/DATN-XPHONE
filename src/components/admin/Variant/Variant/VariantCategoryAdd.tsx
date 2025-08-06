import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
// import { IVariantCategory } from '../../../../interface/variant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface IVariantCategory {
  _id?: string;
  name: string;
}

const VariantCategoryAdd: React.FC = () => {
  const { control, handleSubmit } = useForm<IVariantCategory>();
  const nav = useNavigate();
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (data: IVariantCategory) => axios.post('http://localhost:5000/api/variant-category', data),
    onSuccess: () => {
      message.success('Thêm danh mục biến thể thành công');
      qc.invalidateQueries({ queryKey: ['variantCategories'] });
      nav('/admin/variant/list');
    },
    onError: (_error, _variables, _context) => {
  message.error('Thêm thất bại');
},

  });

  const onSubmit = (data: IVariantCategory) => mut.mutate(data);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item label="Tên danh mục biến thể" required>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Không được để trống' }}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={mut.status === 'pending'}>
          Thêm mới
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VariantCategoryAdd;