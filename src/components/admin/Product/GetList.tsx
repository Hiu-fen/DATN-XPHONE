import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button, Input, message, Popconfirm, Space, Table ,Tooltip } from "antd";
import axios from "axios";
import { IProduct } from "../../../interface/product";
import { useNavigate, useLocation } from "react-router-dom";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

import type { ColumnsType } from 'antd/es/table';

interface ICategory {
  _id: string;
  name: string;
}

const GetList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const nav = useNavigate();
  const location = useLocation();

  // Lấy danh sách sản phẩm
  const {
    data: products,
    isLoading: loadingProducts,
    error: errorProducts,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/products")).data as IProduct[],
  });

  // Lấy danh sách danh mục
  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await axios.get("http://localhost:5000/api/category")).data as ICategory[],
  });

  // Reload khi location.state.forceReload = true
  useEffect(() => {
    if (location.state?.forceReload) {
      refetch();
    }
  }, [location.state?.forceReload, refetch]);

  // Xử lý xóa sản phẩm
  const mutation = useMutation({
    mutationFn: async (id: string) =>
      await axios.delete(`http://localhost:5000/api/products/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công");
      refetch();
    },
    onError: () => {
      message.error("Xóa thất bại");
    },
  });

  const onDelete = (id: string) => {
    mutation.mutate(id);
  };

  // Lọc sản phẩm theo searchText (theo _id, name, mota, price, danhmuc)
  const search = products?.filter((p) => {
    const text = `${p._id} ${p.name} ${p.mota} ${p.price} ${p.danhmuc}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });

  // Cột bảng
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
          style={{ width: 100, objectFit: "cover", borderRadius: 8 }}
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
      {text.length > 50 ? text.slice(0, 50) + '...' : text}
    </Tooltip>
  ),
},
    {
      title: "Danh mục",
      key: "danhmuc",
      render: (_: any, record: IProduct) => {
        // Nếu danhmuc đã là tên, hiển thị luôn; nếu là id, tìm và hiển thị tên
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
        const color = isAvailable ? "green" : "red";
        return <span style={{ color }}>{statusText}</span>;
      },
    },
    {
      title: "Đang bán?",
      key: "status",
      dataIndex: "status",
      render: (status: boolean) => (
        <span style={{ color: status ? "green" : "gray" }}>
          {status ? "Đang bán" : "Ngừng bán"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: IProduct) => (
        <Space>
          <Button type="default" onClick={() => nav(`/admin/phone/${record._id}`)}>
            <EyeOutlined />
          </Button>

          <Button
            type="primary"
            onClick={() => nav(`/admin/phone/${record._id}/edit`)}
          >
            <EditOutlined />
          </Button>

          <Popconfirm
            title="Thông báo"
            description="Bạn chắc chắn muốn xóa?"
            icon={<DeleteOutlined style={{ color: "red" }} />}
            onConfirm={() => record._id && onDelete(record._id)}
            okText="OK"
            cancelText="NO"
          >
            <Button danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loadingProducts || loadingCategories) return <p>Đang tải dữ liệu...</p>;
  if (errorProducts || errorCategories) return <p>Lỗi khi tải dữ liệu.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Input.Search
          placeholder="Tìm kiếm sản phẩm..."
          className="mb-4"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        dataSource={search || []}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          pageSizeOptions: ["5", "10", "20"],
        }}
      />
    </div>
  );
};

export default GetList;
