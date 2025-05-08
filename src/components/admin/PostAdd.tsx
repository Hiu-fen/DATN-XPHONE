import React, { useEffect, useState } from 'react'
import { IProduct } from '../../interface/product';
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

interface ICategory {
  id: number;
  name: string;
}

const PostAdd = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IProduct>();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await axios.get('http://localhost:4000/category');
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: IProduct) => {
      const response = await axios.post('http://localhost:4000/products', data);
      return response.data;
    },
    onSuccess: () => {
      message.success("Thêm mới thành công");
      nav('/admin/phone/list');
    }
  });

  const onSubmit = (data: IProduct) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm sản phẩm</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
          <input
            type="text"
            {...register('name', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập tên"
          />
          <span className="text-red-700">{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
          <input
            type="number"
            {...register('price', { required: "Không để trống", min: { value: 1, message: "Tối thiểu là 1 vnd" } })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập giá"
          />
          <span className="text-red-700">{errors.price?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input
            type="text"
            {...register('mota', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập mô tả"
          />
          <span className="text-red-700">{errors.mota?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            {...register('danhmuc', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="text-red-700">{errors.danhmuc?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            {...register('trangthai', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn trạng thái -- </option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
          <span className="text-red-700">{errors.trangthai?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Thêm mới
        </button>
      </form>
    </div>
  );
};

export default PostAdd;
