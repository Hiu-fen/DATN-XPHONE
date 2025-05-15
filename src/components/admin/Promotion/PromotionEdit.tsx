import { useForm } from "react-hook-form"
import { Promotion } from "../../../interface/promotion"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { message } from "antd"

const PutEditPromotion = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Promotion>()

  const nav = useNavigate()

  const params = useParams()

  useQuery({
    queryKey: ['promotions', params.id],
    queryFn: async () => {
      try {
        const {data:product} = await axios.get(`http://localhost:4000/promotions/${params.id}`)
        reset(product)
        return product
      } catch (error) {
        console.log(error);
        throw error
      }
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: Promotion) => {
      try {
        const {data:promotion} = await axios.put(`http://localhost:4000/promotions/${params.id}`, data)
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
    mutation.mutate(data)
  }

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
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("code", 
              { required: "Mã khuyến mãi không được để trống" }
            )}
          />
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
                <option value="freeShip">Miễn phí ship</option>
                <option value="sale20%">Giảm giá 20%</option>
                <option value="sale50k">Giảm giá 50k</option>
          </select>
          <span className="text-red-500">{errors.discountType?.message}</span>
        </div>

        {/* Sản phẩm áp dụng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm áp dụng</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("applicableProducts", 
              { required: "Sản phẩm áp dụng không được để trống" }
            )}
          >
                <option value="">-- Chọn sản phẩm --</option>
                <option value="Iphone">IPhone</option>
                <option value="SamSung">SamSung</option>
          </select>
          <span className="text-red-500">{errors.applicableProducts?.message}</span>
        </div>

        {/* Điều kiện áp dụng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện áp dụng</label>
          <input
            type="text"
            placeholder="Không bắt buộc"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
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
                { required: "Ngày kết thúc không được để trống" }
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
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            {...register("status", 
              { required: "Trạng thái không được để trống" }
            )}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="true">Hoạt động</option>
            <option value="false">Hết hạn</option>
          </select>
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
