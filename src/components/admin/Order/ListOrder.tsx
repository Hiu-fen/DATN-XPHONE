import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Table, Select, message, Tag, Input, Button, Space } from "antd";
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

  const {
    data: orders,
    refetch,
    isLoading,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/orders");
      console.log("Orders data from server:", response.data); // Debug dữ liệu server
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
    mutationFn: async ({
      id,
      returnStatus,
    }: {
      id: string;
      returnStatus: string;
    }) => {
      await axios.patch(`http://localhost:5000/api/orders/${id}/return`, {
        returnStatus,
      });
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái trả hàng thành công");
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Lỗi khi xử lý trả hàng");
    },
  });

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

  const handleMarkAsPaid = (id: string) => {
    markAsPaidMutation.mutate(id);
  };

  const handleStatusChange = (
    id: string,
    currentStatus: string,
    newStatus: string
  ) => {
    if (!statusOptions.includes(newStatus)) {
      message.error("Trạng thái không hợp lệ");
      return;
    }

    if (
      currentStatus === "Giao thành công" ||
      currentStatus === "Đã huỷ" ||
      currentStatus === "Trả hàng/Hoàn tiền"
    ) {
      message.warning(`Không thể thay đổi từ trạng thái "${currentStatus}"`);
      return;
    }

    const currentIndex = statusOptions.indexOf(currentStatus);
    const newIndex = statusOptions.indexOf(newStatus);

    if (
      newStatus !== "Đã huỷ" &&
      newStatus !== "Trả hàng/Hoàn tiền" &&
      newIndex !== currentIndex + 1
    ) {
      message.warning("Chỉ có thể chuyển sang trạng thái tiếp theo");
      return;
    }

    mutation.mutate({ id, status: newStatus });
  };

  const handleReturnAction = (id: string, returnStatus: string) => {
    returnMutation.mutate({ id, returnStatus });
  };

 const filteredOrders = orders
  ?.filter((o) => {
    const text = `${o.orderCode} ${o.customerName} ${o.phone} ${o.total}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sắp xếp mới nhất lên đầu

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      width: 150,
      render: (_: any, record: Order) => (
        <a
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => navigate(`/admin/orders/${record._id}`)}
        >
          {record.orderCode}
        </a>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      width: 150,
      render: (total: number) => total.toLocaleString() + " VND",
    },
    {
      title: "Thanh toán",
      key: "isPaid",
      width: 160,
      render: (_: any, record: Order) => {
        if (record.refunded) {
          return <Tag color="red">Đã hoàn tiền</Tag>;
        }
        if (record.isPaid) {
          return (
            <Tag color="green">
              {record.paymentMethod === "COD"
                ? "COD - Đã thanh toán"
                : "Đã thanh toán"}
            </Tag>
          );
        }
        return (
          <Select
            value={
              record.paymentMethod === "COD"
                ? "COD - Chưa thanh toán"
                : "Chưa thanh toán"
            }
            style={{ width: 140 }}
            onChange={() => handleMarkAsPaid(record._id)}
            options={[{ label: "Đã thanh toán", value: "paid" }]}
            disabled={[
              "Giao thành công",
              "Đã huỷ",
              "Trả hàng/Hoàn tiền",
            ].includes(record.status)}
          />
        );
      },
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 160,
      render: (method: string) => method || "Chưa xác định",
    },
    {
      title: "Trạng thái trả hàng",
      dataIndex: "returnStatus",
      key: "returnStatus",
      width: 200,
      render: (status: string, record: Order) => (
        <Space>
          <span>{status || "-"}</span>
          {status === "Đang chờ duyệt" && (
            <>
              <Button
                size="small"
                onClick={() => handleReturnAction(record._id, "Đã duyệt")}
              >
                Duyệt
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleReturnAction(record._id, "Từ chối")}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái đơn hàng",
      key: "status",
      width: 180,
      render: (_: any, record: Order) => (
        <Select
          value={record.status}
          onChange={(value) =>
            handleStatusChange(record._id, record.status, value)
          }
          style={{ width: 160 }}
          options={getValidStatusOptions(record.status)}
          placeholder="Chọn trạng thái"
          disabled={
            record.status === "Hoàn thành" ||
            record.status === "Đã huỷ" ||
            record.status === "Trả hàng/Hoàn tiền"
          }
        />
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">Danh sách đơn hàng</h2>
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
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          pageSizeOptions: ["5", "10", "20"],
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default OrderList;
