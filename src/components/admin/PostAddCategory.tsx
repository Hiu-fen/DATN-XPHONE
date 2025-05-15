
import React from 'react'
import { IProduct } from '../../interface/product';
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Icatagory } from '../../interface/category';


const PostAddCategory = () => {
 

 
  const {register,handleSubmit,formState:{errors}} = useForm<Icatagory>()
  const nav = useNavigate();
 
  const mutation = useMutation({
    mutationFn: async (data:Icatagory) => {
      try {
        const {data:product} = await axios.post(`http://localhost:4000/category`,data)
        return product
      } catch (error) {
        console.log(error);   
      }
    },onSuccess:()=>{
      message.success("Thêm mới thành công")
      nav('/category/phone/list')
    }
  })
  const onSubmit = (data:Icatagory)=>{
    mutation.mutate(data)
  }
 

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
           {...register('name',{required:"Không để trống",minLength:{value:5,message:"Tối thiểu là 5 ký tự"}})}
          />
          <span className='text-red-700'>{errors.name?.message}</span>
         
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh danh mục</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên"
           {...register('image',{required:"Không để trống",minLength:{value:5,message:"Tối thiểu là 5 ký tự"}})}
          />
          <span className='text-red-700'>{errors.image?.message}</span>
         
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên"
           {...register('mota',{required:"Không để trống",minLength:{value:5,message:"Tối thiểu là 5 ký tự"}})}
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
