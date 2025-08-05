import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
// import { IVariantCategory } from '../../../../interface/variant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

interface IVariantCategory {
  _id?: string;
  name: string;
}

const VariantCategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, reset } = useForm<IVariantCategory>();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery<IVariantCategory>({
    queryKey: ['variantCategories', id],
    queryFn: () => axios.get(`http://localhost:5000/api/variant-category/${id}`).then(r => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mut = useMutation({
    mutationFn: (vals: IVariantCategory) => axios.put(`http://localhost:5000/api/variant-category/${id}`, vals),
    onSuccess: () => {
      message.success('Cập nhật danh mục biến thể thành công');
      qc.invalidateQueries({ queryKey: ['variantCategories'] });
      nav('/admin/variant/list');
    },
    onError: () => {
  message.error('Cập nhật thất bại');
},
  });

  const onSubmit = (vals: IVariantCategory) => mut.mutate(vals);

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
        <Button
          type="primary"
          htmlType="submit"
          loading={mut.status === 'pending'}
          block
        >
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VariantCategoryEdit;