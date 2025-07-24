import { GiftOutlined } from "@ant-design/icons";

const PromotionSection = () => {
  return (
    <div className="bg-white rounded-md shadow-sm border border-red-400">
      <div className="bg-red-500 text-white px-3 py-1.5 flex items-center gap-2 font-semibold text-base justify-center rounded-t-md">
        <GiftOutlined className="text-lg" />
        <span>Khuyến mãi đặc biệt</span>
      </div>
      <div className="p-3 text-sm text-gray-700 space-y-1">
        <p>
          - Giảm <span className="text-red-600 font-semibold">250.000đ</span> khi
          mua kèm gói bảo hành VIP 12 tháng 1 Đổi 1.
        </p>
        <p>
          - Trả góp qua Home PayLater giảm thêm 5% tối đa{" "}
          <span className="text-red-600 font-semibold">500.000đ</span>.
        </p>
        <p>
          - Hỗ trợ trả góp 0% chỉ cần CCCD gắn chip hoặc 0% qua thẻ tín dụng.
        </p>
      </div>
    </div>
  );
};

export default PromotionSection;
