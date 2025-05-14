import { useEffect, useState } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IComment } from '../../../interface/comments';
import { IProduct } from '../../../interface/product';

const CommentAdd = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IComment>();
  const [products, setProduct] = useState<IProduct[]>([]);
  const nav = useNavigate();
  const { productIdParam } = useParams(); 

  
  useEffect(() =>{
    const fetchProduct = async () =>{
      const { data } = await axios.get(`http://localhost:4000/products`)
      setProduct(data)
    };
    fetchProduct();
  }, [])


  const mutation = useMutation({
    mutationFn: async (data: IComment) => {
      const response = await axios.post('http://localhost:4000/comments', data);
      return response.data;
    },
    onSuccess: () => {
      message.success("Thêm bình luận thành công");
      nav(`/admin/comment/list`); 
    },
    onError: (error) => {
      message.error("Có lỗi xảy ra. Vui lòng thử lại");
    },
  });


 const onSubmit = async (data: IComment) => {
  
  const newComment = {
    ...data,
    date: new Date().toISOString(),  
    likes: 0,
  };

  try {
    // Gửi bình luận với trường date
    await axios.post('http://localhost:4000/comments', newComment);
    message.success("Thêm bình luận thành công");
    nav(`/admin/comment/list`);  
  } catch (error) {
    message.error("Thêm bình luận thất bại");
    console.error("Lỗi khi thêm bình luận:", error);
  }
};


  
  return ( 
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm bình luận cho sản phẩm</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên người dùng</label>
          <input
            type="text"
            {...register('user', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập tên người dùng"
          />
          <span className="text-red-700">{errors.user?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bình luận</label>
          <textarea
            {...register('content', { required: "Không để trống" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập nội dung bình luận"
          />
          <span className="text-red-700">{errors.content?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn sản phẩm</label>
          <select
            {...register('sanpham', { required: "Vui lòng chọn sản phẩm" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products?.map((product: IProduct) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <span className="text-red-700">{errors.sanpham?.message}</span>
        </div>

        <button
          type="submit"  
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >   
        Thêm 
        </button>
      </form>
    </div>
  );
};

export default CommentAdd;