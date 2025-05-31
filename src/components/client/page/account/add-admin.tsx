import React, { useState } from 'react';
import AccountSiba from './siba';
import axios from 'axios';

const AddAccountAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sdt: '',
    address: '',
    gender: '',
    dob: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/user/register', {
        ...formData,
        role: 'admin',
      });
      alert('Tạo tài khoản admin thành công!');
      setFormData({
        name: '',
        email: '',
        password: '',
        sdt: '',
        address: '',
        gender: '',
        dob: '',
      });
    } catch (error) {
      console.error('Lỗi tạo tài khoản:', error);
      alert('Tạo tài khoản thất bại.');
    }
  };

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10">
      {/* Sidebar giống Account */}
      <AccountSiba />

      {/* Form đăng ký */}
      <div className="flex-grow p-10 bg-white rounded-r-lg shadow-md">
        <h1 className="text-3xl font-bold mb-1">Thêm tài khoản admin</h1>
        <p className="text-gray-600 text-sm mb-8">Nhập thông tin tài khoản admin</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <InfoInput label="Tên đăng nhập" name="name" value={formData.name} onChange={handleChange} />
          <InfoInput label="Email" name="email" value={formData.email} onChange={handleChange} />
          <InfoInput label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} type="password" />
          <InfoInput label="SĐT" name="sdt" value={formData.sdt} onChange={handleChange} />
          <InfoInput label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} />
          <InfoInput label="Giới tính" name="gender" value={formData.gender} onChange={handleChange} />
          <InfoInput label="Ngày sinh" name="dob" value={formData.dob} onChange={handleChange} type="date" />

          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Thêm tài khoản admin
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
  type = 'text'
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
