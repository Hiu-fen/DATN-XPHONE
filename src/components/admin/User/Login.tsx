import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";
import { User } from "../../interface/user";

const Login = () => {
    const {
      register,
      handleSubmit,
      formState: { errors }
    } = useForm<User>()

    const nav = useNavigate()

    const mutation = useMutation({
      mutationFn: async (data:User) => {
        try {
          const res = await axios.post(`http://localhost:4000/login`, data)
          return res.data
        } catch (error) {
          console.log(error)        
        }
      },
      onSuccess: (data) => {
        if (data && data.accessToken) {
          message.success("Đăng nhập thành công")
          localStorage.setItem('token', data.accessToken)
          nav('/')
        } else {
          message.error("Đăng nhập thất bại, vui lòng kiểm tra lại email và mật khẩu!")
        }
      }
      
    })

    const onSubmit = (data:User) => {
      mutation.mutate(data)
    }
    return (
      <div className="max-w-xl mx-auto p-6 bg-white border">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">dang nhap</h2>
  
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email',{
                required: "email khong duoc de trong",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Vui lòng nhập đúng định dạng email",
              },
              })}
            />
            <span className="text-red-500">{errors.email?.message}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('password',{
                required: "password khong duoc de trong",
                min: {
                  value: 6,
                  message:"password phai tren 6 "
                }
              })}
            />
            <span className="text-red-500">{errors.password?.message}</span>
          </div>

          {/* Nút thêm mới */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              dang nhap
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default Login
  