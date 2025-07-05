import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input, Button, Divider, Card, Spin, message } from "antd";
import {
  DownOutlined,
  UpOutlined,
  TagOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { FiCopy, FiCheck } from "react-icons/fi";
import dayjs from "dayjs";
import { getPublicPromotions } from "../../../../api/client/promotionApiClient";

const VoucherInput = ({ onApply }: { onApply: (code: string) => void }) => {
  const [code, setCode] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleForm = () => setShowForm(!showForm);

  // Fetch danh sách khuyến mãi
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["public-promotions"],
    queryFn: getPublicPromotions,
    enabled: showForm, // chỉ fetch khi mở
  });

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim());
    }
  };

  const handleSelectCode = (selectedCode: string) => {
    setCode(selectedCode);
    message.success(`Đã chọn mã ${selectedCode}`);
  };

  const handleCopyCode = (selectedCode: string) => {
    navigator.clipboard.writeText(selectedCode);
    setCopiedCode(selectedCode);
    message.success(`Đã sao chép mã ${selectedCode}`);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="mt-3 rounded-md overflow-hidden border border-green-600">
      {/* Header Toggle */}
      <div
        onClick={toggleForm}
        className="flex justify-between items-center px-4 py-3 bg-green-600 cursor-pointer"
      >
        <span className="text-sm font-medium text-white">Mã Giảm Giá</span>
        <span className="text-white text-xs flex items-center gap-1">
          Nhập mã tại đây {showForm ? <UpOutlined /> : <DownOutlined />}
        </span>
      </div>

      {showForm && (
        <>
          <Divider className="!my-0" />
          <div className="p-3 bg-white space-y-3">
            {/* Danh sách khuyến mãi */}
            <div>
              {isLoading ? (
                <Spin size="small" tip="Đang tải mã..." />
              ) : promotions?.length ? (
                <div
                  className={`flex flex-col gap-2 ${
                    promotions.length > 2
                      ? "max-h-52 overflow-y-auto pr-1"
                      : ""
                  }`}
                >
                  {promotions.map((promo: any) => (
                    <Card
                      key={promo._id}
                      size="small"
                      className="hover:shadow-sm transition-all cursor-pointer border border-green-300 rounded-md p-2" // thêm p-2 để thay bodyStyle
                      onClick={() => handleSelectCode(promo.code)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium text-green-700 text-sm">
                            {promo.name}
                          </h5>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                            <ClockCircleOutlined /> HSD: {dayjs(promo.endDate).format("DD/MM/YYYY")}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mb-0">
                            <TeamOutlined /> Còn: {promo.quantity} lượt
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-green-600 text-xs">
                            {promo.code}
                          </span>
                          <Button
                            size="small"
                            type="link"
                            icon={
                              copiedCode === promo.code ? (
                                <FiCheck />
                              ) : (
                                <FiCopy />
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(promo.code);
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Hiện chưa có mã nào.</p>
              )}
            </div>

            {/* Form nhập mã */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  prefix={<TagOutlined />}
                  placeholder="Nhập mã khuyến mãi"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-sm py-1.5"
                />
              </div>
              <div className="sm:w-36 w-full">
                <Button
                  type="primary"
                  onClick={handleApply}
                  className="w-full py-1.5 font-medium bg-green-600 border-green-600 hover:!bg-green-700 hover:!border-green-700 text-sm"
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VoucherInput;
