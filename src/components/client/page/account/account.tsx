// ✅ FULL CODE sau khi chuyển Tỉnh/TP, Quận/Huyện, Phường/Xã sang <select> và ẩn khi chưa chỉnh sửa

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import AccountSiba from './siba';

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [originalUser, setOriginalUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [detail, setDetail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (!localUser) return;
    const { email } = JSON.parse(localUser);
    axios.get(`http://localhost:5000/api/users?email=${email}`)
      .then(res => {
        const userData = res.data;
        setUser(userData);
        setOriginalUser(userData);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    axios.get('https://provinces.open-api.vn/api/?depth=1').then(res => setProvinces(res.data));
  }, []);

  useEffect(() => {
    if (province)
      axios.get(`https://provinces.open-api.vn/api/p/${province}?depth=2`).then(res => setDistricts(res.data.districts));
  }, [province]);

  useEffect(() => {
    if (district)
      axios.get(`https://provinces.open-api.vn/api/d/${district}?depth=2`).then(res => setWards(res.data.wards));
  }, [district]);

  const getNameByCode = (code: string, list: any[]) => list.find(i => i.code === Number(code))?.name || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "datn-xphone");
    formData.append("cloud_name", "dx3ffn8li");
    const res = await fetch("https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.secure_url) setUser((prev: any) => ({ ...prev, avatar: data.secure_url }));
  };

  const handleSave = async () => {
    if (!user || !originalUser) return;
    const fullAddress = `${detail}, ${getNameByCode(ward, wards)}, ${getNameByCode(district, districts)}, ${getNameByCode(province, provinces)}`;
    const updatedFields: any = {};
    for (const key in user) {
      if (user[key] !== originalUser[key]) updatedFields[key] = user[key];
    }
    if (fullAddress !== originalUser.address) updatedFields.address = fullAddress;
    try {
      const { data: updatedUser } = await axios.patch(`http://localhost:5000/api/users/${user._id}`, updatedFields);
      setUser(updatedUser);
      setOriginalUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      setShowAddressEdit(false);
      navigate("/");
      setTimeout(() => window.location.reload(), 500);
    } catch {
      message.error("Cập nhật thất bại.");
    }
  };

  if (!user) return <p className="p-10">Đang tải dữ liệu...</p>;

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10">
      <AccountSiba />
      <div className="flex-grow p-10 bg-white rounded-r-lg shadow-md relative flex flex-col md:flex-row items-start gap-10">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-1">Hồ sơ của tôi</h1>
          <div className="bg-white p-8 rounded-lg border border-gray-300 shadow-sm space-y-5">
            <InfoRow label="Tên đăng nhập" name="name" value={user.name} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Email" name="email" value={user.email} editable={isEditing} onChange={handleChange} />
            <InfoRow label="SĐT" name="sdt" value={user.sdt} editable={isEditing} onChange={handleChange} />
            <div onClick={() => isEditing && setShowAddressEdit(true)}>
              <InfoRow label="Địa chỉ" name="address" value={user.address} editable={false} />
            </div>
            {isEditing && showAddressEdit && (
              <>
                <SelectRow label="Tỉnh/TP" value={province} options={provinces} onChange={setProvince} />
                <SelectRow label="Quận/Huyện" value={district} options={districts} onChange={setDistrict} />
                <SelectRow label="Phường/Xã" value={ward} options={wards} onChange={setWard} />
                <InfoRow label="Chi tiết" name="detail" value={detail} editable={true} onChange={(e) => setDetail(e.target.value)} />
              </>
            )}
            <InfoRow label="Giới tính" name="gender" value={user.gender || ''} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Vai trò" name="role" value={user.role} editable={false} />
            <InfoRow label="Trạng thái" name="active" value={user.active ? 'Đang hoạt động' : 'Bị khóa'} editable={false} className={user.active ? 'text-green-600' : 'text-red-600'} />
            <InfoRow label="Ngày sinh" name="dob" value={user.dob || ''} editable={isEditing} onChange={handleChange} />

            {isEditing ? (
              <button onClick={handleSave} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Lưu</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Chỉnh sửa</button>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-center mt-[150px] ml-[70px]">
          <img src={user.avatar || 'https://picsum.photos/200'} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-[#ffcad4] shadow-xl mx-auto" />
          <p className="mt-2 text-gray-600 text-sm">Ảnh đại diện</p>
          {isEditing && (
            <>
              <button onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Chọn ảnh</button>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, name, onChange, editable, className = '' }: {
  label: string,
  value: string,
  name: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  editable?: boolean,
  className?: string
}) => (
  <div className="flex items-center">
    <label className="w-32 font-bold text-gray-700 text-right mr-4">{label}</label>
    {editable ? (
      <input type="text" name={name} value={value} onChange={onChange} className="flex-grow p-2 bg-white border border-gray-300 rounded" />
    ) : (
      <p className={`flex-grow p-2 bg-gray-100 rounded ${className}`}>{value}</p>
    )}
  </div>
);

const SelectRow = ({ label, value, options, onChange }: {
  label: string,
  value: string,
  options: any[],
  onChange: (value: string) => void
}) => (
  <div className="flex items-center">
    <label className="w-32 font-bold text-gray-700 text-right mr-4">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-grow p-2 bg-white border border-gray-300 rounded"
    >
      <option value="">-- Chọn {label} --</option>
      {options.map((opt) => (
        <option key={opt.code} value={opt.code}>{opt.name}</option>
      ))}
    </select>
  </div>
);

export default Account;
