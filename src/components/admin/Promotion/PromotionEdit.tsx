import { Controller, useForm } from "react-hook-form";
import { Promotion } from "../../../interface/promotion";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DatePicker, message, Switch } from "antd";
import {
  getAllCategory,
  getPromotionById,
  getRandomCode,
  updatePromotion,
} from "../../../api/promotionApi";
import { useEffect, useState } from "react";
import { ICategory } from "../../../interface/category";
import Select from "react-select";
import moment, { Moment } from "moment";

const PutEditPromotion = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    getValues,
    control,
  } = useForm<Promotion>();

  const [code, setCode] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const discountType = watch("discountType")

  const discountTypeOptions = [
    { value: "free_ship", label: "Miễn phí ship" },
    { value: "percent", label: "Khuyến mãi phần trăm" },
    { value: "fixed", label: "Khuyến mãi 200k" },
  ];

  const nav = useNavigate()

  const params = useParams()

  // Lấy danh mục sản phẩm
  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: getAllCategory,
  });

  // Cập nhật option danh mục khi data có
  useEffect(() => {
    if (categories?.data) {
      const options = categories.data.map((cat: ICategory) => ({
        label: cat.name,
        value: cat._id,
      }));
      setCategoryOptions(options);
    }
  }, [categories]);

  // Lấy thông tin khuyến mãi cần cập nhật
  useQuery({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      if (!params.id) return;
      const { data: promotion } = await getPromotionById(params.id);

const formattedPromotion = {
  ...promotion,
  startDate: promotion.startDate ? new Date(promotion.startDate).toISOString() : null,
  endDate: promotion.endDate ? new Date(promotion.endDate).toISOString() : null,
  applicableCategories: promotion.applicableCategories?.map(
    (cat: ICategory) => cat._id
  ) || [],
};


      reset(formattedPromotion);
      setCode(promotion.code);
      setValue("status", promotion.status);
      return promotion; 
    },
  });

  useEffect(() => {
    if (discountType !== "percent") {
      setValue("discountValue", undefined);
    }
  }, [discountType, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: Promotion) => {
      const { data: promotion } = await updatePromotion(
        params.id as string,
        data
      );
      return promotion;
    },
    onSuccess: () => {
      message.success("Cập nhật khuyến mãi thành công");
      nav("/admin/promotion/list");
    },
    onError: () => {
      message.error("Cập nhật khuyến mãi thất bại");
    },
  });

const onSubmit = (data: Promotion) => {
  mutation.mutate({
    ...data,
    code,
    applicableCategories: data.applicableCategories || [],
  });
}

  const handleGenerateCode = async () => {
    try {
      const res = await getRandomCode();
      setCode(res.data.code);
      setValue("code", res.data.code, { shouldValidate: true });
    } catch (error) {
      message.error("Không thể tạo mã khuyến mãi");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Cập nhật khuyến mãi
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên khuyến mãi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khuyến mãi
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("name", {
              required: "Tên khuyến mãi không được để trống",
            })}
          />
          <span className="text-red-500">{errors.name?.message}</span>
        </div>

        {/* Mã khuyến mãi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã khuyến mãi
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full px-4 py-1 border border-gray-300 rounded-md"
              {...register("code", {
                required: "Mã khuyến mãi không được để trống",
              })}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setValue("code", e.target.value, { shouldValidate: true });
              }}
            />
            <button
              type="button"
              onClick={handleGenerateCode}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Tạo mã
            </button>
          </div>
          <span className="text-red-500">{errors.code?.message}</span>
        </div>

        {/* Loại giảm giá */}
        <div>
        <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                <Controller
          name="discountType"
          control={control}
          rules={{ required: "Vui lòng chọn loại giảm giá" }}
          render={({ field }) => (
            <Select
              {...field}
              options={discountTypeOptions}
              value={discountTypeOptions.find(option => option.value === field.value) || null}
              onChange={(option) => field.onChange(option?.value || null)}
              placeholder="-- Chọn loại giảm giá --"
              className="text-black"
              classNamePrefix="select"
              isClearable
            />
          )}

        />
        {errors.discountType && (
          <span className="text-red-500">{errors.discountType.message}</span>
        )}

      </div>

        {/* Input nhập phần trăm nếu chọn percent */}
        {discountType === "percent" && (
          <div>
            <label className="block text-sm font-medium mb-1">Nhập phần trăm giảm phần trăm</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-md"
              {...register("discountValue", {
                required: "Vui lòng nhập % giảm",
                min: { value: 1, message: "Tối thiểu là 1%" },
                max: { value: 100, message: "Tối đa là 100%" },
                valueAsNumber: true,
              })}
            />
            <span className="text-red-500">{errors.discountValue?.message}</span>
          </div>
        )}

        {/* Danh mục áp dụng */}
        <div>
          <label className="block mb-1 font-medium">Sản phẩm áp dụng</label>
          <Controller
            name="applicableCategories"
            control={control}
            rules={{ required: "Vui lòng chọn ít nhất 1 danh mục" }}
            render={({ field }) => (
              <Select
                {...field}
                options={categoryOptions}
                isMulti
                value={categoryOptions.filter((option:any) => field.value?.includes(option.value)) || []}
                onChange={(options) => field.onChange(options ? options.map(option => option.value) : [])}
                placeholder="-- Chọn danh mục --"
                className="text-black"
                classNamePrefix="select"
                isClearable
              />
            )}

          />

          {errors.applicableCategories && (
            <span className="text-red-500">
              {errors.applicableCategories.message}
            </span>
          )}
        </div>

        {/* Điều kiện áp dụng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điều kiện áp dụng
          </label>
          <input
            type="text"
            placeholder="Không bắt buộc"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("condition")}
          />
        </div>

        {/* Số lượng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng khuyến mãi
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("quantity", {
              required: "Số lượng không được để trống",
              min: {
                value: 1,
                message: "Số lượng phải lớn hơn 0",
              },
            })}
          />
          <span className="text-red-500">{errors.quantity?.message}</span>
        </div>

        {/* Ngày bắt đầu / kết thúc */}
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Không được để trống" }}
              render={({ field }) => (
                 <DatePicker
                  placeholder="Chọn ngày bắt đầu"
                  showTime={{ format: 'HH:mm:ss' }} // 👈 Quan trọng
                  format="DD/MM/YYYY HH:mm:ss"     // 👈 Hiển thị ngày + giờ
                  value={field.value ? moment(field.value) : null} // 👈 Convert ISO string thành moment
                  onChange={(value) => {
                    field.onChange(value ? value.toISOString() : null); // 👈 Convert lại khi lưu
                  }}
                  className="w-full"
                />
              )}
            />
            <span className="text-red-500">{errors.startDate?.message}</span>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <Controller
              name="endDate"
              control={control}
              rules={{
                required: "Không được để trống",
                validate: (value) => {
                  const start = getValues("startDate");
                  // So sánh thời gian, nếu null hoặc undefined thì báo lỗi
                  if (!value) return "Không được để trống";
                  if (!start) return true; // Nếu chưa có ngày bắt đầu thì không kiểm tra
                  // Chuyển về moment để so sánh
                  const startMoment = moment(start);
                  const endMoment = moment(value);
                  return endMoment.isSameOrAfter(startMoment) || "Ngày kết thúc phải sau ngày bắt đầu";
                },
              }}
              render={({ field }) => (
                <DatePicker
                  placeholder="Chọn ngày kết thúc"
                  showTime = {{ format: 'HH:mm:ss' }}
                  format="DD/MM/YYYY HH:mm:ss"
                  value={field.value ? moment(field.value) : null}
                  onChange={(value: Moment | null) => {
                    field.onChange(value ? value.toISOString() : null);
                  }}
                  className="w-full"
                />
              )}
            />
            <span className="text-red-500">{errors.endDate?.message}</span>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả khuyến mãi
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("description", {
              required: "Mô tả không được để trống",
            })}
          />
          <span className="text-red-500">{errors.description?.message}</span>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <Switch
            checked={getValues("status") || false}
            onChange={(checked) => setValue("status", checked, { shouldValidate: true })}
            checkedChildren="Đang hoạt động"
            unCheckedChildren="Không hoạt động"
            className="mb-4 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Cập nhật khuyến mãi
        </button>
      </form>
    </div>
  );
};

export default PutEditPromotion;
