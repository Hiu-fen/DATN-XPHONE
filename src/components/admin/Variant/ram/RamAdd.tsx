// src/components/admin/Ram/RamAdd.tsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { IRam } from '../../../../interface/variant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RamAdd: React.FC = () => {
  const { control, handleSubmit } = useForm<IRam>();
  const nav = useNavigate();
  const qc  = useQueryClient();

  const mut = useMutation({
    mutationFn: (data: IRam) => axios.post('http://localhost:5000/api/rams', data),
    onSuccess: () => {
      message.success('Thêm RAM thành công');
      qc.invalidateQueries({ queryKey: ['rams'] });
      nav('/admin/variant/list');
    },
    onError: (error) => {
      console.error(error);
      message.error('Thêm thất bại');
    },
  });

  const onSubmit = (data: IRam) => {
    mut.mutate(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item label="Dung lượng (VD: 4GB)" required>
        <Controller
          name="size"
          control={control}
          rules={{ required: 'Không được để trống' }}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Thêm mới
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RamAdd;
