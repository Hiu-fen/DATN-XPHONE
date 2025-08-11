import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { IContact } from '../../../interface/contact';

const ContactAdd = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IContact>();
  const navigate = useNavigate();


  const mutation = useMutation({
    mutationFn: async (data: IContact) => {
      const response = await axios.post('http://localhost:5000/api/contacts', data);
      return response.data;
    },
    onSuccess: () => {
      message.success('Thêm liên hệ thành công');
      navigate('/admin/contact/list');
    },
    onError: () => {
      message.error('Gửi liên hệ thất bại, vui lòng thử lại!');
      console.log(errors)
    },
  });

  // Hàm xử lý submit form
  const onSubmit = (data: IContact) => {
    const contactData: IContact = {
      ...data,
      status: false, 
      date: new Date().toLocaleDateString('en-GB'),
    };
    mutation.mutate(contactData);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thêm liên hệ</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
          <input
            type="text"
            {...register('name', { required: 'Không để trống họ tên' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập họ tên"
          />
          <span className="text-red-700">{errors.name?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Không để trống email',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Email không hợp lệ',
              },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập email"
          />
          <span className="text-red-700">{errors.email?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input
            type="text"
            {...register('phone', { required: 'Không để trống số điện thoại' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập số điện thoại"
          />
          <span className="text-red-700">{errors.phone?.message}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
          <textarea
            {...register('message', { required: 'Không để trống nội dung' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập nội dung liên hệ"
          />
          <span className="text-red-700">{errors.message?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Gửi liên hệ
        </button>
      </form>
    </div>
  );
};

export default ContactAdd;
