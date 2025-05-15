// components/admin/User/Login.tsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import bcrypt from "bcryptjs";

interface LoginForm {
  email: string;
  password: string;
}

const LoginAdmin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const nav = useNavigate();

 
const onSubmit = async (data: LoginForm) => {
  try {
    // Chỉ tìm theo email
    const res = await axios.get(`http://localhost:4000/users?email=${data.email}`);
    const user = res.data[0];

    if (!user) {
      return message.error("Sai email hoặc mật khẩu");
    }

    // So sánh mật khẩu nhập vào với hash
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return message.error("Sai email hoặc mật khẩu");
    }

    if (user.role !== 'admin') {
      return message.error("Tài khoản không có quyền admin");
    }
if (user.active === false) {
      return message.error("Tài khoản đã bị tạm dừng");
    }
    // Đăng nhập thành công
    localStorage.setItem("user", JSON.stringify(user));
    message.success("Đăng nhập thành công");
    nav("/admin/category/list");

  } catch (error) {
    message.error("Đăng nhập thất bại");
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
      </form>
    </div>
  );
};

export default LoginAdmin;
