import React, { useState } from 'react'
import { ICategory } from '../../../interface/category';
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const PostAddCategory = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ICategory>()
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const image = watch("image");

  const mutation = useMutation({
    mutationFn: async (data: ICategory) => {
      try {
        const { data: category } = await axios.post(`http://localhost:5000/api/category`, data)
        return category
      } catch (error) {
        console.log(error);
        message.error("Thêm thất bại");
      }
    },
    onSuccess: () => {
      message.success("Thêm mới thành công")
      nav('/admin/category/list')
    }
  })

  const onSubmit = (data: ICategory) => {
    mutation.mutate(data)
  }

  const upLoadImage = async (file: FileList | null) => {
    if (!file || file.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file[0]);
    formData.append("upload_preset", "datn-xphone");
    const endPoint = "https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload";

    try {
      const { data } = await axios.post(endPoint, formData);
      setValue("image", data.url, { shouldValidate: true });
      message.success("Tải ảnh thành công");
    } catch (error) {
      console.error(error);
      message.error("Lỗi upload ảnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm mới danh mục</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên"
            {...register('name', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } })}
          />
          <span className='text-red-700'>{errors.name?.message}</span>
        </div>

        {/* Ảnh danh mục - Upload Cloudinary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh danh mục</label>
          <input type="file" accept="image/*" onChange={(e) => upLoadImage(e.target.files)} />
          {loading && <p>Đang tải ảnh...</p>}
          {image && (
            <img
              src={image}
              alt="Ảnh danh mục"
              className="mt-2 rounded"
              style={{ maxWidth: "150px", maxHeight: "150px" }}
            />
          )}
          <input type="hidden" {...register("image", { required: "Ảnh không được để trống" })} />
          <span className='text-red-700'>{errors.image?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả"
            {...register('mota', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } })}
          />
          <span className='text-red-700'>{errors.mota?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Thêm mới
        </button>
      </form>
    </div>
  )
}

export default PostAddCategory
