import { useForm } from "react-hook-form";
import { Promotion } from "../../../interface/promotion";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import {
  addPromotion,
  getAllCategory,
  getRandomCode,
} from "../../../api/promotionApi";
import { useState } from "react";
import { ICategory } from "../../../interface/category";

const PostAddPromotion = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<Promotion>();

  const [code, setCode] = useState<string>("");

  const nav = useNavigate();

  // Gửi dữ liệu thêm khuyến mãi
  const mutation = useMutation({
    mutationFn: async (data: Promotion) => {
      try {
        const { data: promotion } = await addPromotion(data);
        return promotion;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      message.success("Thêm khuyến mãi thành công");
      nav("/admin/promotion/list");
    },
    onError: () => {
      message.error("Thêm khuyến mãi thất bại");
    },
  });

  // Gửi dữ liệu từ form
  const onSubmit = (data: Promotion) => {
    const selectedCategories = Array.isArray(data.applicableCategories)
      ? data.applicableCategories
      : [data.applicableCategories];

    mutation.mutate({
      ...data,
      code,
      applicableCategories: selectedCategories,
    });
  };

  // Hàm tạo mã khuyến mãi ngẫu nhiên
  const handleGenerateCode = async () => {
    try {
      const res = await getRandomCode();
      setCode(res.data.code);
      setValue("code", res.data.code, { shouldValidate: true });
    } catch (error) {
      message.error("Không thể tạo mã khuyến mãi");
    }
  };

  // Lấy danh mục sản phẩm
  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: getAllCategory,
  })

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Thêm khuyến mãi
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên khuyến mãi */}
        <div>
          <label className="block text-sm font-medium mb-1">Tên khuyến mãi</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            {...register("name", { required: "Tên khuyến mãi không được để trống" })}
          />
          <span className="text-red-500">{errors.name?.message}</span>
        </div>

        {/* Mã khuyến mãi và nút tạo mã */}
        <div>
          <label className="block text-sm font-medium mb-1">Mã khuyến mãi</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full px-4 py-1 border rounded-md"
              {...register("code", { required: "Mã khuyến mãi không được để trống" })}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setValue("code", e.target.value, { shouldValidate: true });
              }}
            />
            <button
              type="button"
              onClick={handleGenerateCode}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Tạo mã
            </button>
          </div>
          <span className="text-red-500">{errors.code?.message}</span>
        </div>

        {/* Loại giảm giá */}
        <div>
          <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            {...register("discountType", {
              required: "Loại giảm giá không được để trống",
            })}
          >
            <option value="">-- Chọn loại giảm giá --</option>
            <option value="free_ship">Miễn phí ship</option>
            <option value="giam_10%">Khuyến mãi 10%</option>
            <option value="giam_50k">Khuyến mãi 50k</option>
          </select>
          <span className="text-red-500">{errors.discountType?.message}</span>
        </div>

        {/* Chọn nhiều danh mục áp dụng */}
        <label className="block mb-1 font-medium">Sản phẩm áp dụng</label>
        <select
          {...register("applicableCategories", { required: "Vui lòng chọn danh mục" })}
          className="w-full p-2 border border-gray-300 rounded-md"
          defaultValue=""
        >
          <option value="">-- Chọn loại sản phẩm --</option>
          {categories?.data.map((category: ICategory) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.applicableCategories && (
          <span className="text-red-500 text-sm mt-1 block">
            {errors.applicableCategories.message}
          </span>
        )}

        {/* Điều kiện áp dụng (không bắt buộc) */}
        <div>
          <label className="block text-sm font-medium mb-1">Điều kiện áp dụng</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            {...register("condition")}
            placeholder="Không bắt buộc"
          />
        </div>

        {/* Số lượng khuyến mãi */}
        <div>
          <label className="block text-sm font-medium mb-1">Số lượng khuyến mãi</label>
          <input
            type="number"
            className="w-full px-4 py-2 border rounded-md"
            {...register("quantity", {
              required: "Số lượng khuyến mãi không được để trống",
              min: {
                value: 1,
                message: "Số lượng phải lớn hơn 0",
              },
            })}
          />
          <span className="text-red-500">{errors.quantity?.message}</span>
        </div>

        {/* Ngày bắt đầu và kết thúc */}
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md"
              {...register("startDate", { required: "Không được để trống" })}
            />
            <span className="text-red-500">{errors.startDate?.message}</span>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md"
              {...register("endDate", {
                required: "Không được để trống",
                validate: (value) => {
                  const start = getValues("startDate");
                  return (
                    new Date(value) >= new Date(start) ||
                    "Ngày kết thúc phải sau ngày bắt đầu"
                  );
                },
              })}
            />
            <span className="text-red-500">{errors.endDate?.message}</span>
          </div>
        </div>

        {/* Mô tả khuyến mãi */}
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả khuyến mãi</label>
          <textarea
            className="w-full px-4 py-2 border rounded-md"
            {...register("description", {
              required: "Không được để trống mô tả",
            })}
          />
          <span className="text-red-500">{errors.description?.message}</span>
        </div>

        {/* Trạng thái hoạt động */}
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <label className="inline-flex items-center space-x-2">
            <input type="checkbox" {...register("status")} />
            <span>Hoạt động</span>
          </label>
        </div>

        {/* Nút thêm */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Thêm khuyến mãi
        </button>
      </form>
    </div>
  )
}

export default PostAddPromotion;
