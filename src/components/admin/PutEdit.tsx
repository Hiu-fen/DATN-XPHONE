import React from 'react'
import { useForm } from 'react-hook-form'
import { IProduct } from '../../interface/product'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { message } from 'antd'

interface ICategory {
  id: number;
  name: string;
}

const PutEdit = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<IProduct>()
  const nav = useNavigate();
  const params = useParams();

  // Lấy sản phẩm cần sửa
  const { data: productData } = useQuery({
    queryKey: ['products', params.id],
    queryFn: async () => {
      const { data: product } = await axios.get(`http://localhost:4000/products/${params.id}`)
      reset(product);
      return product;
    }
  });

  // Lấy danh sách danh mục
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:4000/category`);
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: IProduct) => {
      try {
        const { data: product } = await axios.put(`http://localhost:4000/products/${params.id}`, data)
        return product
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: () => {
      message.success("Cập nhật thành công")
      nav('/phone/list')
    }
  });

  const onSubmit = (data: IProduct) => {
    mutation.mutate(data)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên sản phẩm"
            {...register('name', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu 5 ký tự" } })}
          />
          <span className='text-red-700'>{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập giá"
            {...register('price', { required: "Không để trống", min: { value: 1, message: "Tối thiểu là 1" } })}
          />
          <span className='text-red-700'>{errors.price?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả"
            {...register('mota', { required: "Không để trống" })}
          />
          <span className='text-red-700'>{errors.mota?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('danhmuc', { required: "Không để trống" })}
          >
            <option value="">Chọn danh mục</option>
            {categories?.map((cat: ICategory) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className='text-red-700'>{errors.danhmuc?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('trangthai', { required: "Không để trống" })}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
          <span className='text-red-700'>{errors.trangthai?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Cập nhật sản phẩm
        </button>
      </form>
    </div>
  )
}

export default PutEdit
