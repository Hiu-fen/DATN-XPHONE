import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Table, Select, message, Tag, Input } from "antd";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
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
}

// Thứ tự trạng thái đúng theo luồng xử lý
const statusOptions = [
  "Chờ xác nhận",
  "Đang xử lý",
  "Đã giao",
  "Hoàn thành",
  "Đã huỷ"
];

const OrderList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const {
    data: orders,
    refetch,
    isLoading,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/orders");
      return res.data;
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
    onError: () => {
      message.error("Lỗi khi cập nhật trạng thái");
    },
  });

  const handleStatusChange = (
    id: string,
    currentStatus: string,
    newStatus: string
  ) => {
    const currentIndex = statusOptions.indexOf(currentStatus);
    const newIndex = statusOptions.indexOf(newStatus);

    if (newStatus === "Đã huỷ") {
      mutation.mutate({ id, status: newStatus });
      return;
    }

    if (newIndex <= currentIndex) {
      message.warning("Không thể quay lại trạng thái trước!");
      return;
    }

    if (newIndex === -1) {
      message.error("Trạng thái không hợp lệ");
      return;
    }

    mutation.mutate({ id, status: newStatus });
  };

  const filteredOrders = orders?.filter((o) => {
    const text = `${o.orderCode} ${o.customerName} ${o.phone} ${o.total}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
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
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Sản phẩm",
      key: "items",
      render: (_: any, record: Order) => (
        <ul style={{ paddingLeft: 20 }}>
          {record.items.map((item) => (
            <li key={item.productId}>
              {item.productName} x {item.quantity} -{" "}
              {item.price.toLocaleString()} VND
            </li>
          ))}
        </ul>
      ),
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
      render: (_: any, record: Order) =>
        record.isPaid ? (
          <Tag color="green">Đã thanh toán</Tag>
        ) : (
          <Tag color="red">Chưa thanh toán</Tag>
        ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: Order) => (
        <Select
          value={record.status}
          onChange={(value) =>
            handleStatusChange(record._id, record.status, value)
          }
          style={{ width: 160 }}
        >
          {statusOptions.map((status) => (
            <Select.Option key={status} value={status}>
              {status}
            </Select.Option>
          ))}
        </Select>
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
      />
    </div>
  );
};

export default OrderList;
