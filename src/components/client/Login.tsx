// components/admin/User/Login.tsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import bcrypt from "bcryptjs";
import { Mail, Lock, ShoppingCart } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
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
   nav ('/')
  

  } catch (error) {
    message.error("Đăng nhập thất bại");
  }
};


 return (
<div className="flex "> 
  {/* Left side - Image */}
<div className="w-1/2 hidden md:block">
  <img 
    src="./src/assets/bannerlogin.png"
    alt="Login banner"
    className="w-full max-h-[650px] object-cover"
  />
</div>



    {/* Right side - Form */}
    <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center">Đăng nhập tài khoản</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Email</label>
            <div className="relative">
              <input
                {...register("email", { required: "Email không được để trống" })}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Nhập Email của bạn "
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Password</label>
            <div className="relative">
              <input
                {...register("password", { required: "Mật khẩu không được để trống" })}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Nhập mật khẩu"
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Đăng nhập
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            Chưa có tài khoản? <a href="register" className="text-blue-500 hover:underline"> Đăng ký ngay</a>
          </p>
        </form>
      </div>
    </div>
  </div>
);
};

export default Login;
