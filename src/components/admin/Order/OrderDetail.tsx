import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  Descriptions,
  Table,
  Typography,
  Divider,
  Spin,
  Alert,
  Button,
  Space,
  message,
  Select,
} from "antd";

const { Title } = Typography;

interface OrderItem {
  productId: string;
  productName: string;
  soluong: number;
  price: number;
  snapshot?: {
    name: string;
    price: number;
    image?: string;
    color?: string;
    storage?: string;
  };
}

interface IOrder {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  isPaid: boolean;
  paymentMethod?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  returnStatus?: string;
  returnReason?: string;
  statusHistory?: { status: string; timestamp: string }[];
}

const statusOptions = [
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang giao",
  "Giao thành công",
  "Hoàn thành",
  "Đã huỷ",
  "Trả hàng/Hoàn tiền",
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const getValidStatusOptions = (currentStatus: string) => {
    if (
      currentStatus === "Giao thành công" ||
      currentStatus === "Đã huỷ" ||
      currentStatus === "Trả hàng/Hoàn tiền"
    ) {
      return [{ label: currentStatus, value: currentStatus }];
    }
    if (currentStatus === "Đang giao") {
      return [
        { label: "Đang giao", value: "Đang giao" },
        { label: "Giao thành công", value: "Giao thành công" },
        { label: "Trả hàng/Hoàn tiền", value: "Trả hàng/Hoàn tiền" },
      ];
    }
    if (currentStatus === "Chờ xác nhận" || currentStatus === "Đang xử lý") {
      const currentIndex = statusOptions.indexOf(currentStatus);
      const nextStatus = statusOptions[currentIndex + 1];
      return [
        { label: currentStatus, value: currentStatus },
        { label: nextStatus, value: nextStatus },
        { label: "Đã huỷ", value: "Đã huỷ" },
      ];
    }
    return [{ label: currentStatus, value: currentStatus }];
  };

  const { data: order, isLoading, isError, refetch } = useQuery<IOrder>({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
      console.log("Order detail from server:", res.data); // Debug dữ liệu server
      return res.data;
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await axios.patch(`http://localhost:5000/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    },
  });

  const returnMutation = useMutation({
    mutationFn: async ({ id, returnStatus }: { id: string; returnStatus: string }) => {
      return await axios.patch(`http://localhost:5000/api/orders/${id}/return`, { returnStatus });
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái trả hàng thành công");
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Lỗi khi xử lý trả hàng");
    },
  });

  const handleStatusChange = (status: string) => {
    if (!statusOptions.includes(status)) {
      message.error("Trạng thái không hợp lệ");
      return;
    }
    if (
      order?.status === "Giao thành công" ||
      order?.status === "Đã huỷ" ||
      order?.status === "Trả hàng/Hoàn tiền"
    ) {
      message.warning(`Không thể thay đổi từ trạng thái "${order.status}"`);
      return;
    }
    if (order?.status === "Đang giao" && status === "Đã huỷ") {
      message.warning("Không thể hủy đơn hàng đã giao");
      return;
    }
    const currentIndex = statusOptions.indexOf(order?.status || "");
    const newIndex = statusOptions.indexOf(status);
    if (
      status !== "Đã huỷ" &&
      status !== "Trả hàng/Hoàn tiền" &&
      newIndex !== currentIndex + 1
    ) {
      message.warning("Chỉ có thể chuyển sang trạng thái tiếp theo");
      return;
    }
    statusMutation.mutate({ id: id!, status });
  };

  const handleReturnAction = (returnStatus: string) => {
    returnMutation.mutate({ id: id!, returnStatus });
  };

  const shippingFee = 35000;

  const columns = [
    {
      title: "Tên sản phẩm",
      key: "productName",
      width: 200,
      render: (_: any, record: OrderItem) =>
        record.snapshot?.name || record.productName || "Sản phẩm không còn tồn tại",
    },
    {
      title: "Màu sắc",
      key: "color",
      width: 150,
      render: (_: any, record: OrderItem) => record.snapshot?.color || "-",
    },
    {
      title: "Dung lượng",
      key: "storage",
      width: 120,
      render: (_: any, record: OrderItem) => record.snapshot?.storage || "-",
    },
    {
      title: "Số lượng",
      dataIndex: "soluong",
      key: "soluong",
      width: 100,
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price: number) => price?.toLocaleString() + " VND",
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 150,
      render: (_: any, record: OrderItem) =>
        (record.soluong * record.price).toLocaleString() + " VND",
    },
  ];

  if (isLoading) return <Spin tip="Đang tải chi tiết đơn hàng..." />;
  if (isError || !order) {
    return <Alert message="Không tìm thấy đơn hàng" type="error" showIcon />;
  }

  const totalItemsPrice =
    order.items?.reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.soluong,
      0
    ) || 0;

  const totalPayment = totalItemsPrice + shippingFee;

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/admin/orders")}
      >
        Quay lại danh sách đơn hàng
      </Button>

      <Title level={3}>Chi tiết đơn hàng #{order.orderCode}</Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1} size="middle" title="Thông tin người nhận">
          <Descriptions.Item label="Họ tên">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{order.phone}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng">{order.address}</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">
            {new Date(order.date).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">
            {order.paymentMethod || "Chưa xác định"}
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị vận chuyển">
            {order.shippingProvider || "Chưa chọn"}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">{order.notes || "Không có"}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái đơn hàng">
            <Space>
              <Select
                value={order.status}
                onChange={(value) => handleStatusChange(value)}
                style={{ width: 160 }}
                options={getValidStatusOptions(order.status)}
                placeholder="Chọn trạng thái"
                disabled={
                  order.status === "Giao thành công" ||
                  order.status === "Đã huỷ" ||
                  order.status === "Trả hàng/Hoàn tiền"
                }
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái trả hàng">
            <Space>
              <span>{order.returnStatus || "Không có"}</span>
              {order.returnStatus === "Đang chờ duyệt" && (
                <>
                  <Button onClick={() => handleReturnAction("Đã duyệt")}>
                    Duyệt
                  </Button>
                  <Button danger onClick={() => handleReturnAction("Từ chối")}>
                    Từ chối
                  </Button>
                </>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Lý do trả hàng">
            {order.returnReason || "Không có"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Sản phẩm đã đặt">
        <Table
          dataSource={order.items}
          columns={columns}
          rowKey={(item) => item.productId}
          pagination={false}
        />
        <Divider />
        <div style={{ textAlign: "right", fontSize: "16px" }}>
          <p>
            <b>Tạm tính:</b> {totalItemsPrice.toLocaleString()} VND
          </p>
          <p>
            <b>Phí vận chuyển:</b> {shippingFee.toLocaleString()} VND
          </p>
          <p>
            <b>Tổng thanh toán:</b>{" "}
            <span style={{ color: "#e53935" }}>{totalPayment.toLocaleString()} VND</span>
          </p>
        </div>
      </Card>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card title="Lịch sử trạng thái">
          <Table
            dataSource={order.statusHistory}
            columns={[
              { title: "Trạng thái", dataIndex: "status", key: "status" },
              {
                title: "Thời gian",
                dataIndex: "timestamp",
                key: "timestamp",
                render: (date: string) => new Date(date).toLocaleString(),
              },
            ]}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;