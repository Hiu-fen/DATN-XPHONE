// components/client/User/Login.tsx
import axios from "axios";
import { message } from "antd";
import { Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const nav = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      // Gửi POST request tới server thật (MongoDB)
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email: data.email,
        password: data.password,
      });

      const user = res.data.user;

      if (user.active === false) {
        return message.error("Tài khoản đã bị tạm dừng");
      }

      // Lưu vào localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.data.token);

      message.success("Đăng nhập thành công");
      nav("/"); // 👉 điều hướng về trang chính sau khi đăng nhập
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Đăng nhập thất bại";
      message.error(errMsg);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Phần ảnh bên trái */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-red-400 via-pink-500 to-red-600 items-center justify-center">
        <img 
          src="./src/assets/bannerlogin.png" 
          alt="Login banner" 
          className="object-cover max-h-[650px] rounded-l-lg"
        />
      </div>

      {/* Phần form bên phải */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 md:p-16 bg-white rounded-r-lg shadow-lg">
        <h2 className="text-4xl font-extrabold mb-8 text-gray-800 text-center">Đăng nhập tài khoản</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-8">
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
              Email
            </label>
            <input
              id="email"
              {...register("email", { required: "Email không được để trống" })}
              type="email"
              placeholder="Nhập Email của bạn"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            <Mail className="absolute left-3 top-10 text-red-400 w-5 h-5 pointer-events-none" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700">
              Mật khẩu
            </label>
            <input
              id="password"
              {...register("password", { required: "Mật khẩu không được để trống" })}
              type="password"
              placeholder="Nhập mật khẩu"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            <Lock className="absolute left-3 top-10 text-red-400 w-5 h-5 pointer-events-none" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* Button submit */}
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-md transition"
          >
            Đăng nhập
          </button>

          <p className="text-center text-gray-600 mt-4">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-red-500 font-semibold hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
