import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { User } from "../../../interface/user";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";

const RegisterAdmin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<User>();

  const nav = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: User) => {
      await axios.post(`http://localhost:4000/register`, data);
      return data;
    },
    onSuccess: () => {
      message.success("Đăng ký thành công!");
      nav("/admin/login");
    },
    onError: () => {
      message.error("Đăng ký thất bại!");
    }
  });

  /**
   * Xử lý dữ liệu sau khi form được submit
   * 
   * @param {Omit<UserAdmin, "role">} data Dữ liệu từ form
   */
  const onSubmit = (data: Omit<User, "role">) => {
    const adminData: User = { ...data, role: "admin" };
    mutation.mutate(adminData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
          Đăng ký Admin
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <UserOutlined  />
              </span>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("name", {
                  required: "Tên không được để trống",
                  minLength: {
                    value: 3,
                    message: "Tên phải trên 3 ký tự"
                  }
                })}
              />
            </div>
            <p className="text-red-500 text-sm mt-1">{errors.name?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <MailOutlined />
              </span>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Vui lòng nhập đúng định dạng email"
                  }
                })}
              />
            </div>
            <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <LockOutlined />
              </span>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("password", {
                  required: "Mật khẩu không được để trống",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải trên 6 ký tự"
                  }
                })}
              />
            </div>
            <p className="text-red-500 text-sm mt-1">{errors.password?.message}</p>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
