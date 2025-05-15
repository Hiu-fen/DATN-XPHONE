import { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const ProfileAdmin = () => {
    const nav=useNavigate();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    sdt: "",
    avatar: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setForm({
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password || "",
        address: userData.address || "",
        sdt: userData.sdt || "",
        avatar: userData.avatar || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.patch(`http://localhost:4000/users/${user.id}`, form);
      localStorage.setItem("user", JSON.stringify(res.data));
      message.success("Cập nhật thành công!");
      nav("/admin/");

    } catch (error) {
      console.error("Cập nhật thất bại:", error);
      message.error("Cập nhật thất bại!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Thông tin cá nhân</h2>

      <div className="flex flex-col items-center mb-6">
        <img
          src={form.avatar || "https://via.placeholder.com/100"}
          alt="Avatar"
          className="w-28 h-28 rounded-full border-2 border-green-500 object-cover"
        />
        <input
          type="text"
          name="avatar"
          value={form.avatar}
          onChange={handleChange}
          placeholder="URL ảnh đại diện"
          className="mt-3 w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Tên</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input
            type="text"
            name="sdt"
            value={form.sdt}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-1 font-medium">Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleUpdate}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Cập nhật
        </button>
      </div>
    </div>
  );
};

export default ProfileAdmin;
