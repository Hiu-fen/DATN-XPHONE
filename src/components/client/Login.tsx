import axios from "axios";
import { message } from "antd";
import { Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";
import { createNotificationForUser } from "../../api/admin/notificationApi";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const nav = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email: data.email,
        password: data.password,
      });

      const user = res.data.user;

      if (user.active === false) {
        return message.error("Tài khoản đã bị tạm dừng");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", res.data.token);

      await createNotificationForUser({
        userId: user._id,
        message: `Tài khoản "${user.email}" đã đăng nhập hệ thống`,
        type: 'info'
      });

      message.success("Đăng nhập thành công");
      nav("/");
      location.reload();

    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Đăng nhập thất bại";
      message.error(errMsg);
    }
  };

  return (
    <div
      className=" w-[100%] h-[600px] bg-cover bg-center flex items-center justify-center ml-[-80px] mt-[50px]"
      style={{ backgroundImage: `url('/login.png')` }}
    >
      <div className="w-[300px] h-[400px] sm:w-[550px] bg-white bg-opacity-0 rounded-xl p-6 shadow-xl backdrop-blur-md ml-[650px] mt-[-50px]">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center">Đăng nhập tài khoản</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold  text-gray-700">
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

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold  text-gray-700">
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

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-md transition"
          >
            Đăng nhập
          </button>

         <div className="flex items-center justify-between mt-[-20px]">
           <p className="text-center text-gray-600 ">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-red-500 font-semibold hover:underline">
              Đăng ký ngay
            </a>
          </p>

          <div className="text-center text-gray-500 text-xs mt-[-20px] scale-90">
            <GoogleLoginButton mode="login" />
          </div>
         </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
