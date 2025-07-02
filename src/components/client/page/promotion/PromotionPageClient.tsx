import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Card,
  Button,
  Tooltip,
  message,
  Spin,
  Tag,
  Row,
  Col,
  Radio,
} from "antd";
import { FiCopy, FiCheck } from "react-icons/fi";
import { getPublicPromotions } from "../../../../api/client/promotionApiClient";

const PromotionPageClient = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-promotions"],
    queryFn: getPublicPromotions,
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountText = (promo: any) => {
    if (promo.discountType === "free_ship") return "Miễn phí ship (40.000₫)";
    if (promo.discountType === "fixed") return "Giảm 200.000₫";
    const percent = promo.discountValue ?? 0;
    return `Giảm ${percent}%`;
  };

  const getColor = (type: string) => {
    switch (type) {
      case "free_ship":
        return "cyan";
      case "fixed":
        return "volcano";
      case "percent":
        return "green";
      default:
        return "blue";
    }
  };

  const filteredPromotions = data?.filter((promo: any) => {
    if (filterType === "all") return true;
    return promo.discountType === filterType;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin tip="Đang tải danh sách khuyến mãi..." />
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <h2 className="text-center text-blue-600 text-3xl font-semibold mb-6">
        Mã khuyến mãi đang hoạt động
      </h2>

      {/* Bộ lọc loại khuyến mãi */}
      <div className="flex justify-center mb-8">
        <Radio.Group
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">Tất cả</Radio.Button>
          <Radio.Button value="percent">Giảm %</Radio.Button>
          <Radio.Button value="fixed">Giảm cố định</Radio.Button>
          <Radio.Button value="free_ship">Miễn phí ship</Radio.Button>
        </Radio.Group>
      </div>

      {filteredPromotions?.length === 0 ? (
        <p className="text-center">Không có mã khuyến mãi nào.</p>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredPromotions.map((promo: any) => (
            <Col xs={24} sm={12} lg={8} className="h-full" key={promo._id}>
              <div className="h-full flex flex-col">
                <Card
                  hoverable
                  variant="outlined"
                  className="flex flex-col h-full min-h-[340px]"
                  title={
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">
                        {promo.name}
                      </span>
                      <Tooltip title="Sao chép mã">
                        <Button
                          shape="circle"
                          size="small"
                          type="text"
                          icon={
                            copiedCode === promo.code ? (
                              <FiCheck />
                            ) : (
                              <FiCopy />
                            )
                          }
                          onClick={() => handleCopy(promo.code)}
                        />
                      </Tooltip>
                    </div>
                  }
                >
                  <Tag color={getColor(promo.discountType)} className="mb-2">
                    {getDiscountText(promo)}
                  </Tag>

                  <p>
                    <strong>Mã:</strong>{" "}
                    <Tag color="blue" className="font-mono">
                      {promo.code}
                    </Tag>
                  </p>

                  {typeof promo.maxDiscount === "number" && (
                    <p>
                      <strong>Giảm tối đa:</strong>{" "}
                      {promo.maxDiscount.toLocaleString()}₫
                    </p>
                  )}

                  <p>
                    <strong>Áp dụng cho:</strong>{" "}
                    {promo.applicableCategories?.length > 0
                      ? promo.applicableCategories
                          .map((cat: any) => cat.name)
                          .join(", ")
                      : "Tất cả sản phẩm"}
                  </p>

                  <div className="mt-auto">
                    <p>
                      <strong>Hạn sử dụng:</strong>{" "}
                      {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default PromotionPageClient;
