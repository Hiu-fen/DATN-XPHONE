// src/components/admin/Color/ColorEdit.tsx
import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { IColor } from '../../../../interface/variant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ColorEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, reset } = useForm<IColor>();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery<IColor>({
    queryKey: ['colors', id],
    queryFn: () => axios.get(`http://localhost:5000/api/colors/${id}`).then(r => r.data),
    enabled: !!id, // chỉ gọi API khi có id
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mut = useMutation({
    mutationFn: (vals: IColor) => axios.put(`http://localhost:5000/api/colors/${id}`, vals),
    onSuccess: () => {
      message.success('Cập nhật màu thành công');
      qc.invalidateQueries({ queryKey: ['colors'] });
      nav('/admin/variant/list');
    },
    onError: () => {
      message.error('Cập nhật thất bại');
    },
  });

  const onSubmit = (vals: IColor) => mut.mutate(vals);

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

export default ColorEdit;
