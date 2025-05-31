import { useForm } from "react-hook-form"
import { Promotion } from "../../../interface/promotion"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { message } from "antd"
import { getAllCategory, getPromotionById, getRandomCode, updatePromotion } from "../../../api/promotionApi"
import { useState } from "react"
import { ICategory } from "../../../interface/category"

const PutEditPromotion = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues
  } = useForm<Promotion>()

  // State để lưu mã khuyến mãi
  const [code, setCode] = useState<string>("")
  
  const nav = useNavigate()

  const params = useParams()

  useQuery({
    queryKey: ['promotions', params.id],
    queryFn: async () => {
      try {
        if (!params.id) return;
        const { data: promotion } = await getPromotionById(params.id);
        // Format lại ngày tháng
        const formattedPromotion = {
          ...promotion,
          startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().slice(0, 10) : "",
          endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().slice(0, 10) : "",
          applicableCategories: promotion.applicableCategories && promotion.applicableCategories.length > 0
            ? promotion.applicableCategories[0]._id
            : ""  
        };

        reset(formattedPromotion);
        setCode(promotion.code);
        setValue('status', promotion.status);

        return promotion
      } catch (error) {
        console.log(error);
        throw error
      }
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: Promotion) => {
      try {
        const {data:promotion} = await updatePromotion(params.id as string, data)
        return promotion
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    onSuccess: () => {
      message.success('Cập nhật khuyến mãi thành công')
      nav('/admin/promotion/list')
    },
    onError: () => {
      message.error('Cập nhật khuyến mãi thất bại')
    }
  })

  const onSubmit = (data: Promotion) => {
    mutation.mutate({
      ...data,
      code,
    });
  }

  // Hàm tạo mã khuyến mãi ngẫu nhiên
  const handleGenerateCode = async () => {
    try {
      const res = await getRandomCode();
      setCode(res.data.code);
      setValue('code', res.data.code, { shouldValidate: true })
    } catch (error) {
      message.error("Không thể tạo mã khuyến mãi")
    }
  }

  // Lấy danh sách danh mục (nếu cần)
  const { data: categories } = useQuery({
    queryKey: ['category'],
    queryFn: getAllCategory,
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Cập nhật khuyến mãi</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên khuyến mãi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên khuyến mãi</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("name", 
              { required: "Tên khuyến mãi không được để trống" }
            )}
          />
          <span className="text-red-500">{errors.name?.message}</span>
        </div>

        {/* Mã khuyến mãi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã khuyến mãi</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full px-4 py-1 border border-gray-300 rounded-md"
              {...register("code", { required: "Mã khuyến mãi không được để trống" })}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setValue('code', e.target.value, { shouldValidate: true });
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("discountType", 
              { required: "Loại giảm giá không được để trống" }
            )}
          >
                <option value="">-- Chọn loại giảm giá --</option>
                <option value="free_ship">Miễn phí ship</option>
                <option value="giam_10%">Khuyến mãi 10%</option>
                <option value="giam_50k">Khuyến mãi 50k</option>
          </select>
          <span className="text-red-500">{errors.discountType?.message}</span>
        </div>

        {/* Sản phẩm áp dụng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm áp dụng</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("applicableCategories", { required: "Sản phẩm áp dụng không được để trống" })}
          >
            <option value=''>-- Chọn sản phẩm --</option>
            {categories?.data.map((category: ICategory) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="text-red-500">{errors.applicableCategories ?.message}</span>
        </div>

        {/* Điều kiện áp dụng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện áp dụng</label>
          <input
            type="text"
            placeholder="Không bắt buộc"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("condition")}
          />
        </div>

        {/* Số lượng khuyến mãi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng khuyến mãi</label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("quantity",{
              required: "Số lượng khuyến mãi không được để trống",
              min: {
                value: 1,
                message: "Số lượng phải lớn hơn 0"
              }
            })}
          />
          <span className="text-red-500">{errors.quantity?.message}</span>
        </div>
        
        {/* Ngày bắt đầu và ngày kết thúc */}
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              {...register("startDate", 
                { required: "Ngày bắt đầu không được để trống" }
              )}
            />
            <span className="text-red-500">{errors.startDate?.message}</span>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              {...register("endDate", 
                { required: "Ngày kết thúc không được để trống",
                  validate: (value) => {
                    const startDate = getValues("startDate");
                    return new Date(value) >= new Date(startDate) || "Ngày kết thúc phải sau ngày bắt đầu";
                  }
                }
              )}
            />
            <span className="text-red-500">{errors.endDate?.message}</span>
          </div>
        </div>

        {/* Mô tả khuyến mãi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả khuyến mãi</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("description", 
              { required: "Mô tả khuyến mãi không được để trống" }
            )}
          />
          <span className="text-red-500">{errors.description?.message}</span>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={getValues("status") || false}
              onChange={(e) => setValue("status", e.target.checked, { shouldValidate: true })}
            />
            <span>{getValues("status") ? "Đang hoạt động" : "Không hoạt động"}</span>
          </div>
          <span className="text-red-500">{errors.status?.message}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Cập nhật khuyến mãi
        </button>
      </form>
    </div>
  )
}

export default PutEditPromotion
