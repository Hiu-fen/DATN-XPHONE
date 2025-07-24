import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { IRam } from '../../../../interface/variant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const RamEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { control, handleSubmit, reset } = useForm<IRam>();
  const nav = useNavigate();
  const qc  = useQueryClient();

  const { data } = useQuery<IRam>({
    queryKey: ['rams', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/rams/${id}`);
      console.log('Data RAM:', res.data);
      return res.data;
    },
    enabled: !!id, // Chỉ gọi khi có id
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const mut = useMutation({
    mutationFn: (vals: IRam) => axios.put(`http://localhost:5000/api/rams/${id}`, vals),
    onSuccess: () => {
      message.success('Cập nhật RAM thành công');
      qc.invalidateQueries({ queryKey: ['rams'] });
      nav('/admin/variant/list');
    },
    onError() {
  message.error('Cập nhật thất bại');
},
  });

  const onSubmit = (vals: IRam) => mut.mutate(vals);

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item label="Dung lượng" required>
        <Controller
          name="size"
          control={control}
          rules={{ required: 'Không được để trống' }}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={mut.status === 'pending'} block>
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RamEdit;
