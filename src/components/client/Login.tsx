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

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const nav = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      // Tìm user theo email
      const res = await axios.get(`http://localhost:4000/users?email=${data.email}`);
      const user = res.data[0];

      if (!user) {
        return message.error("Sai email hoặc mật khẩu");
      }

      // Kiểm tra nếu tài khoản bị khóa
      if (user.active === false) {
        return message.error("Tài khoản đã bị tạm dừng");
      }

      // So sánh mật khẩu
      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        return message.error("Sai email hoặc mật khẩu");
      }

      // ✅ Đăng nhập thành công
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") {
        message.success("Đăng nhập thành công - tài khoản admin");
      } else if (user.role === "user") {
        message.success("Đăng nhập thành công - tài khoản khách hàng");
      } else {
        message.success("Đăng nhập thành công");
      }

      nav('/');

    } catch (error) {
      console.error(error);
      message.error("Đăng nhập thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Email</label>
          <input
            {...register("email", { required: "Email không được để trống" })}
            type="email"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-red-500 text-sm">{errors.email?.message}</p>
        </div>

        <div>
          <label>Mật khẩu</label>
          <input
            {...register("password", { required: "Mật khẩu không được để trống" })}
            type="password"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-red-500 text-sm">{errors.password?.message}</p>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default Login;
