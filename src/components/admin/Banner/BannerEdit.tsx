import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { IBanner } from '../../../interface/banner';

const BannerEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IBanner>();

  // Lấy dữ liệu banner theo id
  const { data: banner, isLoading } = useQuery({
    queryKey: ['banner', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:4000/banners/${id}`);
      return res.data;
    },
    enabled: !!id, // Chỉ chạy nếu có ID
  });

  useEffect(() => {
    if (banner) {
      reset(banner); // Gán dữ liệu vào form
    }
  }, [banner, reset]);

  const mutation = useMutation({
    mutationFn: async (data: IBanner) => {
      await axios.put(`http://localhost:4000/banners/${id}`, data);
    },
    onSuccess: () => {
      message.success('Cập nhật banner thành công');
      navigate('/admin/banner/list');
    },
    onError: () => {
      message.error('Cập nhật thất bại');
    },
  });

  const onSubmit = (data: IBanner) => {
    mutation.mutate({ ...data, id: Number(id) });
  };

  if (isLoading) return <div>Đang tải dữ liệu banner...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sửa Banner</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên banner</label>
          <input
            type="text"
            {...register('name', { required: 'Không để trống tên banner' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-red-700">{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link hình ảnh</label>
          <input
            type="text"
            {...register('image', { required: 'Không để trống hình ảnh' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-red-700">{errors.image?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link sự kiện</label>
          <input
            type="text"
            {...register('link', { required: 'Không để trống link' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-red-700">{errors.link?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
          <input
            type="date"
            {...register('start_date', { required: 'Chọn ngày bắt đầu' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-red-700">{errors.start_date?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
          <input
            type="date"
            {...register('end_date', { required: 'Chọn ngày kết thúc' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-red-700">{errors.end_date?.message}</span>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('status')} />
          <label className="text-sm font-medium text-gray-700">Hiển thị</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Cập nhật
        </button>
      </form>
    </div>
  );
};

export default BannerEdit;
