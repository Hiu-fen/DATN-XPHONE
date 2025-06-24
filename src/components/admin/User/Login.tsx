import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { User } from "../../../interface/user";
import { createNotificationForAdmin } from "../../../api/admin/notificationApi";

const LoginAdmin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<User>();
  const navigate = useNavigate();

  const onSubmit = async (data: User) => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email: data.email,
        password: data.password,
      });

      const user = res.data.user;

      if (user.role !== "admin") {
        return message.error("Tài khoản không có quyền admin");
      }

      if (!user.active) {
        return message.error("Tài khoản đã bị tạm dừng");
      }

      localStorage.setItem("admin", JSON.stringify(user));
      localStorage.setItem("token", res.data.token);

      await createNotificationForAdmin({
        userId: user._id,
        message: `Admin "${user.email}" vừa đăng nhập hệ thống`,
        type: 'info'
      });

      message.success("Đăng nhập thành công");
      navigate("/admin/category/list");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundImage: "url('https://i.pinimg.com/originals/cb/c2/2c/cbc22ca5a3d7568a742262639a9f6b3f.jpg')", backgroundSize: "cover"}}>
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* Left Panel */}
        <div className="md:w-1/2 bg-gradient-to-br from-green-700 to-green-500 text-white p-10 flex flex-col justify-between">
          <div>
            <img
              src="https://adsmo.vn/wp-content/uploads/2020/12/quan-tri-web-chuyen-nghiep-gia-re-adsmo.png" style={{ width: "600px", height: "250px" }}
              alt="logo"
             
              
            />
            <h2 className="text-3xl font-bold mb-4"> Xin Chào Bạn Đã Đến Hệ Thống Quản Trị Của XPhone</h2>
            <p className="text-sm">
              Hệ thống quản trị XPhone giúp bạn quản lý các danh mục, sản phẩm và đơn hàng một cách dễ dàng và hiệu quả. Hãy đăng nhập để bắt đầu trải nghiệm!
            </p>
          </div>
          
        </div>

        {/* Right Panel - Form */}
        <div className="md:w-1/2 p-10 bg-white">
          <h2 className="text-3xl font-bold text-green-600 mb-6">-------------XPhone-------------</h2>
          <p className="text-red-500 mb-6 text-m text-center ">Bạn cần đăng nhập để tiếp tục</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("email", { required: "Email không được để trống" })}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                {...register("password", { required: "Mật khẩu không được để trống" })}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span></span>
              <a href="#" className="hover:underline">Quên Mật Khẩu</a>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-full transition"
            >
              Đăng Nhập
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Bạn chưa có tài khoản{" "}
            <a href="/admin/register" className="text-green-600 hover:underline">Đăng Ký</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
