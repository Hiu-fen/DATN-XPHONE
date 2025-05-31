import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Promotion } from "../../../interface/promotion";
import { useQuery } from "@tanstack/react-query";
import { getPromotionById } from "../../../api/promotionApi";
import { FiCopy, FiCheck } from "react-icons/fi";
import { message } from "antd";

const DetailPromotion = () => {
  const params = useParams();
  const nav = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);

  const { data: promotion, isLoading, isError, error } = useQuery<Promotion>({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      const { data } = await getPromotionById(params.id as string)
      return data;
    },
    enabled: !!params.id,
  })

  if (isLoading) {
    return <p className="text-center mt-10">Đang tải dữ liệu...</p>
  }

  if (isError) {
    return (
      <p className="text-center mt-10 text-red-600">
        Có lỗi xảy ra khi tải dữ liệu: {(error as Error).message}
      </p>
    )
  }

  if (!promotion) {
    return <p className="text-center mt-10">Không tìm thấy khuyến mãi.</p>
  }

  // Hàm định dạng ngày tháng
  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput)
    return isNaN(date.getTime()) ? String(dateInput) : date.toLocaleDateString("vi-VN")
  }

  // Hàm sao chép mã khuyến mãi 
  const handleCopyCode = () => {
    if (promotion.code) {
      navigator.clipboard.writeText(promotion.code)
      setCopySuccess(true)
      message.success("Đã sao chép mã khuyến mãi!")
      setTimeout(() => setCopySuccess(false), 2000)
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-700">Chi tiết khuyến mãi</h2>
      <div className="space-y-6 text-gray-800">
        <div>
          <p className="text-sm font-semibold">Tên khuyến mãi</p>
          <p className="text-lg">{promotion.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold">Mã khuyến mãi</p>
            <p className="text-lg">{promotion.code}</p>
          </div>
          <button
            onClick={handleCopyCode}
            type="button"
            className="ml-2 p-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
            title="Sao chép mã"
            aria-label="Sao chép mã khuyến mãi"
          >
            {copySuccess ? <FiCheck size={20} /> : <FiCopy size={20} />}
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold">Loại giảm giá</p>
          <p className="text-lg">{promotion.discountType}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Sản phẩm áp dụng</p>
          <p className="text-lg">
            {promotion.applicableCategories && promotion.applicableCategories.length > 0
              ? promotion.applicableCategories[0].name
              : "Không có sản phẩm áp dụng"}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Điều kiện áp dụng</p>
          <p className="text-lg">{promotion.condition || "Không có"}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Số lượng khuyến mãi</p>
          <p className="text-lg">{promotion.quantity || "Không có"}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Ngày bắt đầu</p>
          <p className="text-lg">{formatDate(promotion.startDate)}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Ngày kết thúc</p>
          <p className="text-lg">{formatDate(promotion.endDate)}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Mô tả khuyến mãi</p>
          <p className="text-lg whitespace-pre-line">{promotion.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Trạng thái</p>
          <p
            className={`text-lg font-semibold ${
              promotion.status ? "text-green-600" : "text-red-600"
            }`}
          >
            {promotion.status ? "Hoạt động" : "Hết hạn"}
          </p>
        </div>
      </div>

      <div className="mt-8 gap-2 flex justify-end">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={() => nav(`/admin/promotion/edit/${promotion._id}`)}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default DetailPromotion
