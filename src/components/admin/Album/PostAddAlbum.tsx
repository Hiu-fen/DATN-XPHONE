import React, { useState } from 'react'
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

interface Ialbums {
  name: string;
  description: string;
  image: string[];  // Mảng link ảnh
}

const PostAddAlbum = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Ialbums, 'image'>>()
  const nav = useNavigate();

  const [imageInput, setImageInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async (data: Ialbums) => {
      try {
        const { data: product } = await axios.post(`http://localhost:4000/albums`, data)
        return product
      } catch (error) {
        console.log(error);
      }
    }, onSuccess: () => {
      message.success("Thêm mới thành công")
      nav('/admin/album/list')
    }
  })

  const onAddImage = () => {
    const url = imageInput.trim();
    if (!url) {
      message.error("Bạn chưa nhập link ảnh");
      return;
    }
    if (!url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      message.warning("Nên nhập link ảnh hợp lệ (.jpeg, .jpg, .png, .gif, .webp)");
    }
    setImages(prev => [...prev, url]);
    setImageInput('');
  }

  const onSubmit = (data: Omit<Ialbums, 'image'>) => {
    if (images.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 ảnh");
      return;
    }
    mutation.mutate({
      ...data,
      image: images
    });
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm mới Album ảnh</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên Album ảnh</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên"
            {...register('name', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } })}
          />
          <span className='text-red-700'>{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nhập link ảnh</label>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập link ảnh"
              value={imageInput}
              onChange={e => setImageInput(e.target.value)}
            />
            <button
              type="button"
              onClick={onAddImage}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Hiện ảnh nhỏ đã thêm */}
        <div className="flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img src={img} alt={`img-${index}`} className="w-20 h-20 object-cover rounded-md border" />
              {/* Nút xóa ảnh nhỏ */}
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== index))}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 hover:bg-red-800"
                title="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả"
            {...register('description', { required: "Không để trống", minLength: { value: 5, message: "Tối thiểu là 5 ký tự" } })}
          />
          <span className='text-red-700'>{errors.description?.message}</span>
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

export default PostAddAlbum
