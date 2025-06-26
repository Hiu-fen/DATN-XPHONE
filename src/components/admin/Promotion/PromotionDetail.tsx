import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPromotionById } from "../../../api/admin/promotionApi";
import { Promotion } from "../../../interface/promotion";
import {
  Card,
  Typography,
  Descriptions,
  Button,
  message,
  Tag,
  Tooltip,
  Spin,
  Result,
} from "antd";
import {
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";

const DetailPromotion = () => {
  const params = useParams();
  const nav = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { data: promotion, isLoading, isError, error } = useQuery<Promotion>({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      const { data } = await getPromotionById(params.id as string);
      return data;
    },
    enabled: !!params.id,
  });

  useEffect(() => {
    if (!promotion) return;
    const endDate = new Date(promotion.endDate).getTime();
    const updateTimeLeft = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endDate - now) / 1000));
      setTimeLeft(diff);
    };
    updateTimeLeft();
    const timerId = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timerId);
  }, [promotion]);

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Khuyến mãi đã kết thúc";
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days > 0 ? days + " ngày " : ""}${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const handleCopyCode = () => {
    if (promotion?.code) {
      navigator.clipboard.writeText(promotion.code);
      setCopySuccess(true);
      message.success("Đã sao chép mã khuyến mãi!");
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (isLoading)
    return (
      <div className="text-center mt-20">
        <Spin size="large" tip="Đang tải chi tiết khuyến mãi..." />
      </div>
    );

  if (isError)
    return (
      <Result
        status="error"
        title="Lỗi khi tải dữ liệu"
        subTitle={(error as Error).message || "Không thể lấy thông tin khuyến mãi"}
        extra={
          <Button onClick={() => nav(-1)} icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
        }
      />
    );

  if (!promotion)
    return (
      <Result
        status="404"
        title="Không tìm thấy khuyến mãi"
        subTitle="Khuyến mãi bạn tìm không tồn tại hoặc đã bị xóa."
        extra={
          <Button onClick={() => nav(-1)} icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
        }
      />
    );

  return (
    <Card
      title={
        <div className="text-2xl font-bold text-blue-600">
          Chi tiết khuyến mãi
        </div>
      }
      variant="borderless"
      className="mx-auto mt-10 shadow border-2"
    >
      <Descriptions layout="vertical" column={2} bordered>
        <Descriptions.Item label="Tên khuyến mãi" span={2}>
          {promotion.name}
        </Descriptions.Item>

        <Descriptions.Item label="Mã khuyến mãi">
          <div className="flex items-center gap-2">
            {promotion.code}
            <Tooltip title="Sao chép mã">
              <Button
                shape="circle"
                icon={copySuccess ? <FiCheck /> : <FiCopy />}
                size="small"
                onClick={handleCopyCode}
              />
            </Tooltip>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Loại giảm giá">
          {promotion.discountType === "free_ship" && "Miễn phí ship"}
          {promotion.discountType === "fixed" && "Giảm giá cố định"}
          {promotion.discountType === "percent" &&
            `Giảm ${promotion.discountValue}%`}
        </Descriptions.Item>

        {promotion.discountType === "percent" &&
          promotion.maxDiscount && (
            <Descriptions.Item label="Giảm tối đa">
              {promotion.maxDiscount.toLocaleString()} VNĐ
            </Descriptions.Item>
          )}

        <Descriptions.Item label="Sản phẩm áp dụng" span={2}>
          {promotion.applicableCategories?.length
            ? promotion.applicableCategories.map((cat) => cat.name).join(", ")
            : "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Điều kiện áp dụng">
          {promotion.condition || "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Số lượng khuyến mãi">
          {promotion.quantity ?? "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Số lần đã sử dụng">
          {promotion.usageCount ?? 0}
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian còn lại">
          <Typography.Text type="danger">
            {formatTimeLeft(timeLeft)}
          </Typography.Text>
        </Descriptions.Item>

        <Descriptions.Item label="Ngày bắt đầu">
          {formatDate(promotion.startDate)}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày kết thúc">
          {formatDate(promotion.endDate)}
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả" span={2}>
          <Typography.Paragraph>{promotion.description}</Typography.Paragraph>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái khuyến mãi" span={2}>
          <Tag color={promotion.status ? "success" : "error"}>
            <span className="flex items-center gap-1">
              {promotion.status ? <FiCheckCircle /> : <FiXCircle />}
              {promotion.status ? "Hoạt động" : "Hết hạn"}
            </span>
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <div className="flex justify-end gap-2 mt-6">
        <Tooltip title="Quay lại">
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => nav(-1)}
          />
        </Tooltip>

        <Tooltip title="Chỉnh sửa">
          <Button
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => nav(`/admin/promotion/edit/${promotion._id}`)}
            type="primary"
          />
        </Tooltip>
      </div>
    </Card>
  );
};

export default DetailPromotion;
