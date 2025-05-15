import { useNavigate, useParams } from "react-router-dom";
import { Promotion } from "../../../interface/promotion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const DetailPromotion = () => {
  const params = useParams();
  const nav = useNavigate();

  const { data: promotion } = useQuery<Promotion>({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:4000/promotions/${params.id}`);
      return data;
    },
    enabled: !!params.id,
  });

  if (!promotion) return null;

  const boolStatus = promotion.status === "true";

  // Hiển thị ngày tháng theo định dạng dd/mm/yyyy
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString("vi-VN");
  };


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-green-700">Chi tiết khuyến mãi</h2>
      <div className="space-y-6 text-gray-800">
        <div>
          <p className="text-sm font-semibold">Tên khuyến mãi</p>
          <p className="text-lg">{promotion.name}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Mã khuyến mãi</p>
          <p className="text-lg">{promotion.code}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Loại giảm giá</p>
          <p className="text-lg">{promotion.discountType}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Sản phẩm áp dụng</p>
          <p className="text-lg">
            {Array.isArray(promotion.applicableProducts)
              ? promotion.applicableProducts.join(", ")
              : promotion.applicableProducts}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Điều kiện áp dụng</p>
          <p className="text-lg">{promotion.condition || "Không có"}</p>
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
              boolStatus ? "text-green-600" : "text-red-600"
            }`}
          >
            {boolStatus ? "Hoạt động" : "Hết hạn"}
          </p>
        </div>
      </div>

      <div className="mt-8 gap-2 flex justify-end">
        <button
          onClick={() => nav(-1)}
          className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Quay lại
        </button>
        <button
          onClick={() => nav(`/admin/promotion/edit/${promotion.id}`)}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default DetailPromotion
