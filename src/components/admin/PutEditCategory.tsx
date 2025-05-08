import React from 'react'
import { useForm } from 'react-hook-form'
import { IProduct } from '../../interface/product'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { message } from 'antd'
import { Icatagory } from '../../interface/category'


const PutEditCategory = () => {
  
  

  const {register,handleSubmit,formState:{errors},reset} = useForm<Icatagory>()
  const nav = useNavigate();
  const params = useParams();
  const {data} = useQuery({
    queryKey:['products',params.id],
    queryFn: async () =>{
      const {data:product} = await axios.get(`http://localhost:4000/category/${params.id}`)
      reset (product)
      return product
    }
  })
  const mutation = useMutation({
    mutationFn: async (data:Icatagory) => {
      try {
        const {data:product} = await axios.put(`http://localhost:4000/category/${params.id}`,data)
        return product
      } catch (error) {
        console.log(error);   
      }
    },onSuccess:()=>{
      message.success("Sửa thành công")
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

export default PutEditCategory
