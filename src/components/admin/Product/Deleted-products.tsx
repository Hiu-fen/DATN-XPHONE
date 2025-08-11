import React, { useState } from "react";
import {
  Button,
  Input,
  message,
  Space,
  Table,
  Tooltip,
  Popconfirm,
  Select,
} from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { IProduct } from "../../../interface/product";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, RollbackOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface ICategory {
  _id: string;
  name: string;
}

const Deleted_products: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filterTime, setFilterTime] = useState("all");
  const nav = useNavigate();

  const { data: products, isLoading: loadingProducts, error: errorProducts, refetch } = useQuery({
    queryKey: ["deletedProducts"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/products/deleted")).data as IProduct[],
  });

  const { data: categories, isLoading: loadingCategories, error: errorCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/category")).data as ICategory[],
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.put(`http://localhost:5000/api/products/${id}`, {
        status: true,
      }),
    onSuccess: () => {
      message.success("Khôi phục thành công");
      refetch();
    },
    onError: () => {
      message.error("Khôi phục thất bại");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.delete(`http://localhost:5000/api/products/${id}/hard`),
    onSuccess: () => {
      message.success("Xóa cứng thành công");
      refetch();
    },
    onError: () => {
      message.error("Xóa cứng thất bại");
    },
  });

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handleHardDelete = (id: string) => {
    hardDeleteMutation.mutate(id);
  };

  const deletedProducts = products
    ?.filter((p) => p.status === false)
    .filter((p) => {
      if (!p.createdAt) return false;
      const created = dayjs(p.createdAt);
      const now = dayjs();
      switch (filterTime) {
        case "today":
          return created.isSame(now, "day");
        case "7days":
          return created.isAfter(now.subtract(7, "day"));
        case "30days":
          return created.isAfter(now.subtract(30, "day"));
        default:
          return true;
      }
    })
    .sort((a, b) =>
      new Date(b.createdAt ?? "").getTime() -
      new Date(a.createdAt ?? "").getTime()
    );

  const filtered = deletedProducts?.filter((p) => {
    const text = `${p._id} ${p.name} ${p.mota} ${p.price} ${p.danhmuc}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_: any, __: IProduct, index: number) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Ảnh",
      key: "image",
      dataIndex: "image",
      render: (image: string) => (
        <img
          src={image}
          alt="ảnh"
          className="w-[100px] h-auto object-cover rounded-md"
        />
      ),
    },
    {
      title: "Giá",
      key: "price",
      dataIndex: "price",
      render: (price: number) => (
        <span>{price ? price.toLocaleString() : "Không có giá"}</span>
      ),
    },
    {
      title: "Số lượng",
      key: "soluong",
      dataIndex: "soluong",
      render: (soluong: number) => (
        <span>{soluong ? soluong.toLocaleString() : "Không còn sản phẩm"}</span>
      ),
    },
    {
      title: "Mô tả",
      key: "mota",
      dataIndex: "mota",
      render: (text: string) => (
        <Tooltip title={text}>
          {text.length > 50 ? text.slice(0, 50) + "..." : text}
        </Tooltip>
      ),
    },
    {
      title: "Danh mục",
      key: "danhmuc",
      render: (_: any, record: IProduct) => {
        const found = categories?.find((c) => c._id === record.danhmuc);
        return found ? found.name : record.danhmuc;
      },
    },
    {
      title: "Trạng thái",
      key: "trangthai",
      dataIndex: "trangthai",
      render: (_: any, record: IProduct) => {
        const isAvailable = record.soluong >= 1;
        const statusText = isAvailable ? "Còn hàng" : "Hết hàng";
        const color = isAvailable ? "text-green-600" : "text-red-600";
        return <span className={color}>{statusText}</span>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: IProduct) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="default" onClick={() => nav(`/admin/phone/${record._id}`)}>
              <EyeOutlined />
            </Button>
          </Tooltip>

          <Popconfirm
            title="Khôi phục sản phẩm"
            description="Bạn có chắc muốn khôi phục sản phẩm này?"
            onConfirm={() => handleRestore(record._id!)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Khôi phục">
              <Button type="primary" icon={<RollbackOutlined />} />
            </Tooltip>
          </Popconfirm>

          <Popconfirm
            title="Xóa cứng sản phẩm"
            description="Bạn có chắc muốn xóa vĩnh viễn sản phẩm này? Hành động này không thể hoàn tác!"
            onConfirm={() => handleHardDelete(record._id!)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa vĩnh viễn">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loadingProducts || loadingCategories) return <p>Đang tải dữ liệu...</p>;
  if (errorProducts || errorCategories) return <p>Lỗi khi tải dữ liệu.</p>;

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-green-600">
        Danh sách sản phẩm đã xóa (Ngừng bán)
      </h2>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <Space>
          <Button type="primary" onClick={() => nav("/admin/phone/list")}>
            Quay lại
          </Button>

          <Select
            defaultValue="all"
            className="min-w-[180px]"
            onChange={setFilterTime}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Hôm nay", value: "today" },
              { label: "7 ngày trước", value: "7days" },
              { label: "30 ngày trước", value: "30days" },
            ]}
          />
        </Space>

        <Input.Search
          placeholder="Tìm kiếm sản phẩm đã xóa..."
          className="w-full md:w-[300px]"
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        dataSource={filtered || []}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default Deleted_products;
