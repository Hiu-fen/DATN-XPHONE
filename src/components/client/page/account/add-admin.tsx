import React, { useState } from 'react';
import AccountSiba from './siba';
import { message } from 'antd'; // import message từ antd
// import axios from 'axios'; // nếu bạn cần gửi lên server thì bật lại

const AddAccountAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gửi yêu cầu lên server (comment nếu chưa có backend)
      // await axios.post('http://localhost:5000/api/notifications', {
      //   message: `Yêu cầu phê duyệt tài khoản admin mới: ${formData.email}`,
      //   time: new Date().toLocaleString(),
      //   type: 'admin-register',
      //   createdBy: formData.name,
      //   data: formData,
      // });

      // Thêm thông báo vào localStorage để hiển thị bên header
      const newNotification = {
        message: `Yêu cầu đăng ký tài khoản bán hàng với Tài khoản: ${formData.email}`,
        time: new Date().toLocaleString(),
        type: 'admin-register',
      };

      const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = [...existing, newNotification];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

      // Hiện thông báo thành công dùng antd message
      message.success('Đã gửi yêu cầu tạo tài khoản bán hàng đến admin.');

      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Lỗi gửi yêu cầu:', error);
      message.error('Gửi yêu cầu thất bại.');
    }
  };

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10 min-h-screen">
      <AccountSiba />

      <div className="flex-grow p-10 bg-white rounded-r-lg shadow-md">
        <h1 className="text-3xl font-bold mb-1">Thêm tài khoản bán hàng</h1>
        <p className="text-gray-600 text-sm mb-8">
          Thông tin này sẽ gửi đến admin để xem xét
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InfoInput
            label="Tên bạn là"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <InfoInput
            label="Email bán hàng"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />

          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Gửi yêu cầu tạo tài khoản
          </button>
        </form>
      </div>
    </div>
  );
};

const InfoInput = ({
  label,
  value,
  name,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) => (
  <div className="flex items-center">
    <label className="w-32 font-bold text-gray-700 text-right mr-4">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      className="flex-grow p-2 border border-gray-300 rounded"
    />
  </div>
);

export default AddAccountAdmin;
