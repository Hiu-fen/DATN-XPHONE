import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Table, Select, message, Tag, Input, Button, Space, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";

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

interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  phone: number;
  address: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
  isPaid: boolean;
  refunded?: boolean;
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

const OrderList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const getValidStatusOptions = (currentStatus: string, returnStatus?: string) => {
    if (returnStatus === "Đang chờ duyệt" || returnStatus === "Đã duyệt") {
      return [{ label: currentStatus, value: currentStatus }];
    }
    if (["Giao thành công", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(currentStatus)) {
      return [{ label: currentStatus, value: currentStatus }];
    }
    if (currentStatus === "Đang giao") {
      return [
        { label: "Đang giao", value: "Đang giao" },
        { label: "Giao thành công", value: "Giao thành công" },
      ];
    }
    if (["Chờ xác nhận", "Đang xử lý"].includes(currentStatus)) {
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

  const {
    data: orders,
    refetch,
    isLoading,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/orders");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await axios.patch(`http://localhost:5000/api/orders/${id}`, { status });
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công");
      refetch();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái"
      );
    },
  });

  const returnMutation = useMutation({
    mutationFn: async ({ id, returnStatus }: { id: string; returnStatus: string }) => {
      await axios.patch(`http://localhost:5000/api/orders/${id}/return`, { returnStatus });
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái trả hàng thành công");
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Lỗi khi xử lý trả hàng");
    },
  });

  const handleStatusChange = (id: string, currentStatus: string, newStatus: string) => {
    if (!statusOptions.includes(newStatus)) {
      message.error("Trạng thái không hợp lệ");
      return;
    }
    if (["Giao thành công", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(currentStatus)) {
      message.warning(`Không thể thay đổi từ trạng thái "${currentStatus}"`);
      return;
    }
    const currentIndex = statusOptions.indexOf(currentStatus);
    const newIndex = statusOptions.indexOf(newStatus);
    if (newStatus !== "Đã huỷ" && newStatus !== "Trả hàng/Hoàn tiền" && newIndex !== currentIndex + 1) {
      message.warning("Chỉ có thể chuyển sang trạng thái tiếp theo");
      return;
    }
    mutation.mutate({ id, status: newStatus });
  };

  const handleReturnAction = (id: string, returnStatus: string) => {
    returnMutation.mutate({ id, returnStatus });
  };

  const filteredOrders = orders
    ?.filter((o) => `${o.orderCode} ${o.customerName} ${o.phone} ${o.total}`.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (_: any, record: Order) => (
        <a style={{ cursor: "pointer", color: "#1890ff" }} onClick={() => navigate(`/admin/orders/${record._id}`)}>
          {record.orderCode}
        </a>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => total.toLocaleString() + " VND",
    },
    {
      title: "Thanh toán",
      key: "isPaid",
      render: (_: any, record: Order) => {
        if (record.refunded) return <Tag color="red">Đã hoàn tiền</Tag>;
        if (record.paymentMethod === "COD") {
          return (
            <Tag color={record.status === "Giao thành công" ? "green" : "orange"}>
              {record.status === "Giao thành công" ? "COD - Đã thanh toán" : "COD - Chưa thanh toán"}
            </Tag>
          );
        }
        if (record.isPaid) return <Tag color="green">Đã thanh toán</Tag>;
        return (
          <Select
            value="Chưa thanh toán"
            style={{ width: 140 }}
            onChange={() => handleMarkAsPaid(record._id)}
            options={[{ label: "Đã thanh toán", value: "paid" }]}
          />
        );
      },
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => method || "Chưa xác định",
    },
    {
      title: "Trạng thái trả hàng",
      dataIndex: "returnStatus",
      key: "returnStatus",
      render: (status: string, record: Order) => (
        <Space direction="vertical" size={4}>
          <Tag color={status === "Đã duyệt" ? "green" : status === "Từ chối" ? "red" : "default"}>
            {status || "-"}
          </Tag>
          {status === "Đang chờ duyệt" && (
            <div className="flex gap-2">
              <Tooltip title="Duyệt yêu cầu trả hàng">
                <Button size="small" type="primary" onClick={() => handleReturnAction(record._id, "Đã duyệt")}>Duyệt</Button>
              </Tooltip>
              <Tooltip title="Từ chối yêu cầu trả hàng">
                <Button size="small" danger onClick={() => handleReturnAction(record._id, "Từ chối")}>Từ chối</Button>
              </Tooltip>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      key: "status",
      render: (_: any, record: Order) => (
        <Select
          value={record.status}
          onChange={(value) => handleStatusChange(record._id, record.status, value)}
          style={{ width: 160 }}
          options={getValidStatusOptions(record.status, record.returnStatus)}
          placeholder="Chọn trạng thái"
          disabled={
            ["Hoàn thành", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(record.status) ||
            ["Đang chờ duyệt", "Đã duyệt"].includes(record.returnStatus || "")
          }
        />
      ),
    },
  ];

  const handleMarkAsPaid = (id: string) => {
    markAsPaidMutation.mutate(id);
  };

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.patch(`http://localhost:5000/api/orders/${id}/paid`);
    },
    onSuccess: () => {
      message.success("Cập nhật thanh toán thành công");
      refetch();
    },
    onError: () => {
      message.error("Lỗi khi cập nhật thanh toán");
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Danh sách đơn hàng</h2>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Input.Search
          placeholder="Tìm kiếm theo mã đơn hàng, khách hàng..."
          className="mb-4"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default OrderList;