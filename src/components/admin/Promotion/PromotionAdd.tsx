import { Controller, useForm } from "react-hook-form";
import { Promotion } from "../../../interface/promotion";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Switch } from "antd";
import { addPromotion, getAllCategory, getRandomCode} from "../../../api/promotionApi";
import { useState } from "react";
import { ICategory } from "../../../interface/category";
import Select from "react-select";
import { DatePicker } from "antd";
import moment, { Moment } from "moment";

const PostAddPromotion = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
    control
  } = useForm<Promotion>();

  const [code, setCode] = useState<string>("");
  const discountType = watch("discountType")

  // Các tùy chọn loại giảm giá
  const discountTypeOptions = [
    { value: "free_ship", label: "Miễn phí ship" },
    { value: "percent", label: "Giảm phần trăm" },
    { value: "fixed", label: "Giảm giá cố định" },
  ];

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
    let discountValueToSend: number | undefined = undefined;

    if (data.discountType === "percent" || data.discountType === "fixed") {
      discountValueToSend = data.discountValue;
    }

    mutation.mutate({
      ...data,
      code,
      discountValue: discountValueToSend,
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

  // Chuyển đổi danh mục thành định dạng phù hợp với react-select
  const categoryOptions = categories?.data.map((cat: ICategory) => ({
    label: cat.name,
    value: cat._id,
  })) || [];

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

        {/* Chọn nhiều danh mục cho sản phẩm áp dụng */}
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
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Không được để trống" }}
              render={({ field }) => (
                <DatePicker
                  placeholder="Chọn ngày bắt đầu"
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  // field.value có thể là string hoặc Moment, nên convert về Moment nếu có giá trị
                  value={field.value ? moment(field.value) : null}
                  onChange={(value: Moment | null) => {
                    // Chuyển Moment sang chuỗi ISO để lưu form
                    field.onChange(value ? value.toISOString() : null);
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
                  showTime
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
          <Controller
            name="status"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren="Hoạt động"
                unCheckedChildren="Không hoạt động"
                className="mb-4 rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
              />
            )}
          />
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
