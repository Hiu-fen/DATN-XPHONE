import { useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { addNotification } from "../utils/notification";
import { User } from "../../../interface/user";

const ProfileAdmin = () => {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<User>();

  useEffect(() => {
    const storedUser = localStorage.getItem("admin");
    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      Object.entries(userData).forEach(([key, value]) => {
        setValue(key as keyof User, value);
      });
    }
  }, [setValue]);

  const onSubmit = async (form: User) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const originalData: User = JSON.parse(storedUser);
    if (!originalData?.id) return;

    // Tạo đối tượng chứa chỉ các trường thay đổi
    const updatedFields: Partial<Record<keyof User, string | number | boolean | undefined>> = {};

(Object.keys(form) as (keyof User)[]).forEach((key) => {
  const newValue = form[key];
  const oldValue = originalData[key];
  if (newValue !== oldValue) {
    updatedFields[key] = newValue;
  }
});

    try {
      const res = await axios.patch(`http://localhost:4000/users/${originalData.id}`, updatedFields);
      localStorage.setItem("user", JSON.stringify(res.data));
      addNotification(`Nhắc nhở: \"${res.data.notification}\"`);
      message.success("Cập nhật thành công!");
      nav("/admin/");
    } catch (error) {
      console.error("Cập nhật thất bại:", error);
      message.error("Cập nhật thất bại!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Thông tin cá nhân</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center mb-6">
          <img
            src={"https://via.placeholder.com/100"}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-2 border-green-500 object-cover"
          />
          <input
            type="text"
            placeholder="URL ảnh đại diện"
            className="mt-3 w-full px-3 py-2 border rounded"
            {...register("avatar")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Tên</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              {...register("name", { required: "Tên không được để trống" })}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              {...register("email", { required: "Email không được để trống" })}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              {...register("password")}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Số điện thoại</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              {...register("sdt")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block mb-1 font-medium">Địa chỉ</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              {...register("address")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block mb-1 font-medium">Thông báo</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              {...register("notification")}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileAdmin;
