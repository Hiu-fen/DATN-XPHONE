import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { IBanner } from '../../../interface/banner';



const BannerAdd = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IBanner>();
  const navigate = useNavigate();

  const getNextId = () => {
    const currentId = localStorage.getItem('nextBannerId');
    const nextId = currentId ? parseInt(currentId) + 1 : 1;
    localStorage.setItem('nextBannerId', nextId.toString());
    return nextId;
  };

  const mutation = useMutation({
    mutationFn: async (data: IBanner) => {
      const response = await axios.post('http://localhost:5000/api/banners', data);
      return response.data;
    },
    onSuccess: () => {
      message.success('Thêm banner thành công');
      navigate('/admin/banner/list');
    },
    onError: () => {
      message.error('Gửi banner thất bại, vui lòng thử lại!');
    },
  });

  const onSubmit = (data: IBanner) => {
    const bannerData: IBanner = {
      ...data,
      id: getNextId(),
      status: data.status ?? true
    };
    mutation.mutate(bannerData);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm Banner</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên banner</label>
          <input
            type="text"
            {...register('name', { required: 'Không để trống tên banner' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập tên banner"
          />
          <span className="text-red-700">{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link hình ảnh</label>
          <input
            type="text"
            {...register('image', { required: 'Không để trống hình ảnh' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="https://..."
          />
          <span className="text-red-700">{errors.image?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link sự kiện</label>
          <input
            type="text"
            {...register('link', { required: 'Không để trống link' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="https://..."
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
          <input
            type="checkbox"
            {...register('status')}
            defaultChecked
          />
          <label className="text-sm font-medium text-gray-700">Hiển thị</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Thêm banner
        </button>
      </form>
    </div>
  );
};

export default BannerAdd;
