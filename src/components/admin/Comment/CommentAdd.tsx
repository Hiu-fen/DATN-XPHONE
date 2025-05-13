import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IComment } from '../../../interface/comments';

const CommentAdd = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IComment>();
  const [productId, setProductId] = useState<string>('');
  const nav = useNavigate();
  const { productIdParam } = useParams(); // Lấy ID sản phẩm từ URL

  // Lưu ID sản phẩm từ URL (nếu có)
  useEffect(() => {
    if (productIdParam) {
      setProductId(productIdParam);
    }
  }, [productIdParam]);

  // Hàm gửi dữ liệu bình luận
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

  // Hàm xử lý submit form
  const onSubmit = (data: IComment) => {
    const commentData: IComment = {
      ...data,
      product: productId,  
      status: true, 
      date: new Date().toLocaleDateString('en-GB'),  
    };
    mutation.mutate(commentData);  
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Thêm bình luận
        </button>
      </form>
    </div>
  );
};

export default CommentAdd;
