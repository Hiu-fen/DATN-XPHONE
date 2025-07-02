import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPromotionById, getUsersUsedPromotion } from "../../../api/admin/promotionApi";
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
  Drawer,
} from "antd";
import {
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { ArrowLeftOutlined, EditOutlined, TeamOutlined } from "@ant-design/icons";

const DetailPromotion = () => {
  const params = useParams();
  const nav = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: promotion, isLoading, isError, error } = useQuery<Promotion>({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      const { data } = await getPromotionById(params.id as string);
      return data;
    },
    enabled: !!params.id,
  });

  const { data: usedOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["used-orders", promotion?.code],
    queryFn: () => getUsersUsedPromotion(promotion!.code),
    enabled: isDrawerOpen && !!promotion?.code,
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Chờ xác nhận":
      return "processing";
    case "Đã giao":
      return "success";
    case "Đã huỷ":
      return "error";
    default:
      return "default";
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
    <>
      <Card
        title={
          <div className="text-2xl font-bold text-blue-600">
            Chi tiết khuyến mãi
          </div>
        }
        variant="borderless"
        className="mx-auto mt-10 shadow border-2"
      >
        <Descriptions layout="vertical" column={1} bordered>
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

          <Descriptions.Item label="Giới hạn mỗi người">
            {promotion.maxUsagePerUser
              ? `${promotion.maxUsagePerUser} lần`
              : "Không giới hạn"}
          </Descriptions.Item>

          <Descriptions.Item label="Số người đã sử dụng">
            <div className="flex items-center gap-2">
              {promotion.usageCount ?? 0}
              <Tooltip title="Xem chi tiết người đã sử dụng">
                <Button
                  size="small"
                  shape="circle"
                  icon={<TeamOutlined />}
                  onClick={() => setIsDrawerOpen(true)}
                />
              </Tooltip>
            </div>
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

      <Drawer
        title={`Đơn hàng đã dùng mã "${promotion.code}"`}
        placement="right"
        width={700}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {isLoadingOrders ? (
          <Spin tip="Đang tải..." />
        ) : usedOrders?.length ? (
          <ul className="space-y-3">
            {usedOrders.map((order: any) => (
              <li
                key={order._id}
                className="border p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                onClick={() => nav(`/admin/orders/${order._id}`)}
              >
                <div className="flex justify-between items-center">
                  <strong>{order.customerName}</strong>
                  <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
                </div>
                <p>Email: {order.email}</p>
                <p>Điện thoại: {order.phone}</p>
                <p>Mã đơn: <strong>{order.orderCode}</strong></p>
                <p>Ngày đặt: {new Date(order.date).toLocaleString("vi-VN")}</p>
                <p>
                  Thanh toán:{" "}
                  <Tag color={order.isPaid ? "green" : "red"}>
                    {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                  </Tag>
                </p>
                <p>Phương thức: {order.paymentMethod}</p>
            <p>
              Tổng tiền:{" "}
              {typeof order.total === "number"
                ? order.total.toLocaleString() + "₫"
                : "Không rõ"}
            </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có đơn hàng nào sử dụng mã này.</p>
        )}
      </Drawer>
    </>
  );
};

export default DetailPromotion;
