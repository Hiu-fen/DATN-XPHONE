import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
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
    mutationFn: async (data: any) => {
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
    <div className="flex">
      {/* Left side - Banner */}
      <div className="w-1/2 hidden md:block">
        <img
          src="./src/assets/bannerlogin.png"
          alt="Register banner"
          className="w-full max-h-[650px] object-cover"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-10 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Đăng ký Người dùng
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tên */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Tên</label>
              <div className="relative">
                <input
                  {...register("name", {
                    required: "Tên không được để trống",
                    minLength: { value: 3, message: "Tên phải trên 3 ký tự" },
                  })}
                  type="text"
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                />
                <UserOutlined className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Email</label>
              <div className="relative">
                <input
                  {...register("email", {
                    required: "Email không được để trống",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Vui lòng nhập đúng định dạng email",
                    },
                  })}
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                />
                <MailOutlined className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            {/* Mật khẩu */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Mật khẩu</label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Mật khẩu không được để trống",
                    minLength: { value: 6, message: "Mật khẩu phải trên 6 ký tự" },
                  })}
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
                />
                <LockOutlined className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Đăng ký ngay
            </button>
            <p className="text-center">Hoặc</p>

           
            <p className="text-center text-gray-500 text-sm mt-2">
               <GoogleLoginButton mode="register"/>

            </p>
             <p className="text-center text-gray-500 text-sm mt-4">
              Đã có tài khoản?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                Đăng nhập ngay
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
