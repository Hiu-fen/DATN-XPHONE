import { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { addNotification } from "../utils/notification";
import { User } from "../../../interface/user";

const ProfileAdmin = () => {
  const [showHistory, setShowHistory] = useState(false);

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
    const storedUser = localStorage.getItem("admin");
    if (!storedUser) return;

    const originalData: User = JSON.parse(storedUser);
    if (!originalData?._id) return;

    const updatedFields: Partial<User> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value !== originalData[key as keyof User]) {
        updatedFields[key as keyof User] = value;
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      message.warning("Không có thay đổi nào để cập nhật.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/profile/${originalData._id}`,
        updatedFields
      );
      localStorage.setItem("admin", JSON.stringify(res.data.user));
      addNotification(`Nhắc nhở: \"${res.data.user.notification || "Không có"}\"`);
      message.success("Cập nhật thành công!");
      nav("/admin/");
    } catch (error) {
      console.error("Cập nhật thất bại:", error);
      message.error("Cập nhật thất bại!");
    }
    const updateHistory = getValues("updateHistory");
    if (updateHistory) {
      updateHistory.push({
        updatedAt: new Date().toISOString(),
        changes: Object.entries(updatedFields).map(([field, newValue]) => ({
          field,
          oldValue: originalData[field as keyof User],
          newValue,
        })),
      });
      setValue("updateHistory", updateHistory);
    }


  };

  return (
    <div className="w-full bg-gray-50 py-10">
      <div className="max-w-screen-lg mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-green-700">Thông tin cá nhân</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={getValues("avatar") || "https://via.placeholder.com/150"}
              className="w-28 h-28 rounded-full border-2 border-green-500 object-cover"
            />
            <input
              type="text"
              placeholder="URL ảnh đại diện"
              className="mt-3 w-full max-w-md px-4 py-2 border rounded"
              {...register("avatar")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Tên</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                {...register("name", { required: "Tên không được để trống" })}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                {...register("email", { required: "Email không được để trống" })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium">Mật khẩu</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                {...register("password")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Số điện thoại</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                {...register("sdt")}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Địa chỉ</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                {...register("address")}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-medium">Thông báo</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                {...register("notification")}
              />
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Cập nhật
            </button>
          </div>
        </form>

        {/* Lịch sử cập nhật */}


        {/* Tôi muốn lịch sử cập nhật có thể ẩn hoặc hiện thị */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Lịch sử cập nhật</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mb-4 text-blue-600 hover:underline"
          >
            {showHistory ? "Ẩn lịch sử" : "Hiện lịch sử"}
          </button>
          {showHistory && (
            <ul className="space-y-2">
              {getValues("updateHistory")?.map((history, index) => (
                <li key={index} className="bg-gray-100 p-4 rounded-md">
                  <p className="text-sm text-gray-500 mb-2">
                    Cập nhật lúc: {new Date(history.updatedAt).toLocaleString()}
                  </p>
                  <ul className="space-y-1">
                    {history.changes.map((change, idx) => (
                      <li key={idx} className="text-sm">
                        <strong>{change.field}:</strong> từ{" "}
                        <span className="text-red-500">{change.oldValue}</span> đến{" "}
                        <span className="text-green-500">{change.newValue}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
