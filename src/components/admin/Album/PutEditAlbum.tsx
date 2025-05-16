import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Ialbums } from '../../../interface/albums'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { message } from 'antd'

const PutEditAlbum = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Omit<Ialbums, 'image'>>()
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState<string>('')

  const nav = useNavigate();
  const params = useParams();

  // Lấy dữ liệu album
  const { data } = useQuery({
    queryKey: ['albums', params.id],
    queryFn: async () => {
      const { data: album } = await axios.get(`http://localhost:4000/albums/${params.id}`)
      reset({
        name: album.name,
        description: album.description
      })
      // Gán danh sách ảnh từ mảng đã lưu (nếu là chuỗi thì convert)
      const imgs = Array.isArray(album.image)
        ? album.image
        : album.image?.split(',') ?? []
      setImages(imgs)
      return album
    }
  })

  const mutation = useMutation({
    mutationFn: async (album: Ialbums) => {
      const { data: updated } = await axios.put(`http://localhost:4000/albums/${params.id}`, album)
      return updated
    },
    onSuccess: () => {
      message.success("Cập nhật thành công")
      nav('/admin/album/list')
    }
  })

  const handleAddImage = () => {
    const link = imageInput.trim()
    if (!link) return message.error("Vui lòng nhập link ảnh")
    setImages(prev => [...prev, link])
    setImageInput('')
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (formData: Omit<Ialbums, 'image'>) => {
    if (images.length === 0) {
      message.error("Vui lòng thêm ít nhất 1 ảnh")
      return
    }

    const albumData: Ialbums = {
      ...formData,
      image: images // lưu mảng ảnh
    }

    mutation.mutate(albumData)
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Chỉnh sửa Album ảnh</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Tên album */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
          <input
            type="text"
            {...register('name', {
              required: "Không để trống",
              minLength: { value: 5, message: "Tối thiểu là 5 ký tự" }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập tên"
          />
          <span className="text-red-600">{errors.name?.message}</span>
        </div>

        {/* Thêm ảnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thêm ảnh mới</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={imageInput}
              onChange={e => setImageInput(e.target.value)}
              placeholder="Nhập link ảnh"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Hiển thị danh sách ảnh đã có */}
        <div className="flex flex-wrap gap-3 mt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} className="w-24 h-24 object-cover rounded border" alt={`img-${idx}`} />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-0 text-sm hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input
            type="text"
            {...register('description', {
              required: "Không để trống",
              minLength: { value: 5, message: "Tối thiểu là 5 ký tự" }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập mô tả"
          />
          <span className="text-red-600">{errors.description?.message}</span>
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Cập nhật
        </button>
      </form>
    </div>
  )
}

export default PutEditAlbum
