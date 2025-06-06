import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Promotion } from "../../../interface/promotion";
import { useQuery } from "@tanstack/react-query";
import { getPromotionById } from "../../../api/promotionApi";
import { FiCopy, FiCheck, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { message } from "antd";

const DetailPromotion = () => {
  const params = useParams();

  const nav = useNavigate();

  const [copySuccess, setCopySuccess] = useState(false);

  // Thêm state lưu thời gian còn lại (tính bằng giây)
  const [timeLeft, setTimeLeft] = useState<number>(0);

  
  const { data: promotion, isLoading, isError, error } = useQuery<Promotion>({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      const { data } = await getPromotionById(params.id as string)
      return data;
    },
    enabled: !!params.id,
  })
  
  // Tính thời gian còn lại mỗi khi promotion hoặc thời điểm hiện tại thay đổi
 useEffect(() => {
   if (!promotion) return;

   const endDate = new Date(promotion.endDate).getTime();

   // Hàm cập nhật thời gian còn lại
   const updateTimeLeft = () => {
     const now = Date.now();
     const diff = Math.max(0, Math.floor((endDate - now) / 1000)); // tính giây còn lại, không âm
     setTimeLeft(diff);
   };

   updateTimeLeft(); // tính lần đầu

   // Tạo interval mỗi 1s để cập nhật
   const timerId = setInterval(updateTimeLeft, 1000);

   // Cleanup khi component unmount hoặc promotion thay đổi
   return () => clearInterval(timerId);

 }, [promotion]);

   // Chuyển giây thành định dạng "X ngày Y giờ Z phút W giây"
  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Khuyến mãi đã kết thúc";

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days > 0 ? days + " ngày " : ""}${hours.toString().padStart(2,"0")}:` +
           `${minutes.toString().padStart(2,"0")}:` +
           `${secs.toString().padStart(2,"0")}`;
  }


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
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng tính từ 0
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} lúc ${hour}:${minute}`;
  };

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
      <h2 className="text-3xl font-bold mb-8 text-center">Chi tiết khuyến mãi</h2>
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
          <p className="text-lg">
            {
              promotion.discountType === "free_ship" ? "Miễn phí ship" : 
              promotion.discountType === "percent" ? `Khuyến mãi ${promotion.discountValue}%` :
              promotion.discountType === "fixed" ? "Khuyến mãi 200k" : 
              promotion.discountType
            }
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Sản phẩm áp dụng</p>
          <p className="text-lg">
            {promotion.applicableCategories && promotion.applicableCategories.length > 0
              ? promotion.applicableCategories.map(cat => cat.name).join(", ")
              : "Không có sản phẩm áp dụng"}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Điều kiện áp dụng</p>
          <p className="text-lg">{promotion.condition || "Không có"}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Số lượng khuyến mãi</p>
          <p className="text-lg">{promotion.quantity || "Số lượng đã hết"}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Số lần đã sử dụng</p>
          <p className="text-lg">{promotion.usageCount ?? 0}</p>
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
          <p className="text-sm font-semibold">Thời gian còn lại</p>
          <p className="text-lg font-mono text-red-600">{formatTimeLeft(timeLeft)}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Mô tả khuyến mãi</p>
          <p className="text-lg whitespace-pre-line">{promotion.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">Trạng thái khuyến mãi</p>
          <p
            className={`inline-flex items-center mt-2 gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
              promotion.status
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {promotion.status ? <FiCheckCircle /> : <FiXCircle />}
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
