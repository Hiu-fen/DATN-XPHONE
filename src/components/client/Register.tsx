import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { User } from "../../interface/user";

const Register = () => {
    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<User>()

    const nav = useNavigate()

    const mutation = useMutation({
      mutationFn: async (data:User) => {
        try {
          await axios.post(`http://localhost:4000/register`, data)
          return data
        } catch (error) {
          console.log(error)        
        }
      },
      onSuccess: () => {
        message.success("Đăng ký thành công")
        nav('/client/login')
      }
    })

    const onSubmit = (data:User) => {
      mutation.mutate(data)
    }
    return (
      <div className="min-h-screen bg-gray-50 pt-32 px-4">
        <div className="max-w-md mx-auto p-8 bg-white border rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Đăng ký</h2>
  
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('email', {
                  required: 'Email không được để trống',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Vui lòng nhập đúng định dạng email',
                  },
                })}
              />
              <span className="text-red-500 text-sm">{errors.email?.message}</span>
            </div>
  
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('password', {
                  required: 'Mật khẩu không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                })}
              />
              <span className="text-red-500 text-sm">{errors.password?.message}</span>
            </div>
  
            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Đăng ký
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default Register
  