import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { Mail, Lock, User } from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";

interface UserForm {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: UserForm) => {
      await axios.post("http://localhost:5000/api/users/register", data);
    },
    onSuccess: () => {
      message.success("Đăng ký thành công!");
      navigate("/login");
    },
    onError: () => {
      message.error("Đăng ký thất bại!");
    },
  });

  const onSubmit = (data: UserForm) => {
    const userData = {
      ...data,
      role: "user",
      active: true,
    };
    mutation.mutate(userData);
  };

  return (
    <div
      className="w-full h-[600px] bg-cover bg-center flex items-center justify-center ml-[-80px] mt-[50px]"
      style={{ backgroundImage: `url('/register.png')` }}
    >
      <div className="w-[300px] h-[400px] sm:w-[550px] bg-white bg-opacity-0 rounded-xl p-6 shadow-xl backdrop-blur-md ml-[650px] mt-[-50px]">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">Đăng ký tài khoản</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tên và Email cùng hàng */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Tên */}
            <div className="relative w-full">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Tên</label>
              <input
                id="name"
                {...register("name", {
                  required: "Tên không được để trống",
                  minLength: { value: 3, message: "Tên phải trên 3 ký tự" },
                })}
                type="text"
                placeholder="Nhập tên của bạn"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              <User className="absolute left-3 top-10 text-red-400 w-5 h-5 pointer-events-none" />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="relative w-full">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                id="email"
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                type="email"
                placeholder="Nhập email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              <Mail className="absolute left-3 top-10 text-red-400 w-5 h-5 pointer-events-none" />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
            <input
              id="password"
              {...register("password", {
                required: "Mật khẩu không được để trống",
                minLength: { value: 6, message: "Mật khẩu phải trên 6 ký tự" },
              })}
              type="password"
              placeholder="Nhập mật khẩu"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition ${errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            <Lock className="absolute left-3 top-10 text-red-400 w-5 h-5 pointer-events-none" />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-md transition"
          >
            Đăng ký
          </button>

          {/* Google */}
          <div className="flex items-center justify-between mt-[-20px]">
            <p className="text-center text-gray-600 ">
              Chưa đã có tài khoản?{' '}
              <a href="/login" className="text-red-500 font-semibold hover:underline">
                Đăng nhập ngay
              </a>
            </p>

            <div className="text-center text-gray-500 text-xs mt-[-20px] scale-90">
              <GoogleLoginButton mode="register" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
