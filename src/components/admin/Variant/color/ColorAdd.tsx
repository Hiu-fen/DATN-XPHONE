// src/components/admin/Color/ColorAdd.tsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { IColor } from '../../../../interface/variant';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ColorAdd: React.FC = () => {
  const { control, handleSubmit } = useForm<IColor>();
  const nav = useNavigate();
  const qc  = useQueryClient();

  const mut = useMutation({
    mutationFn: (data: IColor) => axios.post('http://localhost:5000/api/colors', data),
    onSuccess: () => {
      message.success('Thêm màu thành công');
      qc.invalidateQueries({ queryKey: ['colors'] });
      nav('/admin/variant/list');
    },
    // onError: () => message.error('Thêm thất bại'),
  });

  const onSubmit = (data: IColor) => mut.mutate(data);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item label="Tên màu" required>
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

export default ColorAdd;
