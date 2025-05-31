// components/admin/User/Login.tsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import bcrypt from "bcryptjs";
import { addNotification } from "../utils/notification";
import { User } from "../../../interface/user";



const LoginAdmin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<User>();
  const nav = useNavigate();

 
const onSubmit = async (data: User) => {
  try {
    const res = await axios.post("http://localhost:5000/api/user/login", {
      email: data.email,
      password: data.password,
    });

    const user = res.data.user;

    if (user.role !== "admin") {
      return message.error("Tài khoản không có quyền admin");
    }

    if (user.active === false) {
      return message.error("Tài khoản đã bị tạm dừng");
    }

    localStorage.setItem("admin", JSON.stringify(user));
    localStorage.setItem("token", res.data.token); // 👉 nếu dùng token

    addNotification(`Tài khoản "${user.email}" đã đăng nhập vào hệ thống`);
    message.success("Đăng nhập thành công");

    nav("/admin/category/list");
  } catch (error: any) {
    const errMsg = error.response?.data?.message || "Đăng nhập thất bại";
    message.error(errMsg);
    console.error(error);
  }
};


  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Đăng nhập Admin</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Email</label>
          <input {...register("email", { required: "Email không được để trống" })} type="email"
            className="w-full border rounded px-3 py-2" />
          <p className="text-red-500 text-sm">{errors.email?.message}</p>
        </div>

        <div>
          <label>Password</label>
          <input {...register("password", { required: "Mật khẩu không được để trống" })} type="password"
            className="w-full border rounded px-3 py-2" />
          <p className="text-red-500 text-sm">{errors.password?.message}</p>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Đăng nhập</button>
<div className="flex items-center gap-2">
  <p>Bạn chưa có tài khoản?</p>
  <a href="register" className="text-blue-700">Thêm tài khoản ngay</a>
</div>

      
      </form>
    </div>
  );
};

export default LoginAdmin;
