"use client" // Đảm bảo đây là một Client Component

import type React from "react"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Search } from "lucide-react"
import { Button, Table, Modal, message } from "antd"
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"

// Định nghĩa các interface ngay trong file này
interface IRam {
  _id?: string
  size: string
}

interface IColor {
  _id?: string
  name: string
}

interface IVariantCategory {
  _id?: string
  name: string
}

const API_BASE_URL = "http://localhost:5000/api" // URL API cơ sở

const VariantList: React.FC = () => {
  const queryClient = useQueryClient()

  // State cho các thanh tìm kiếm của từng bảng
  const [ramSearchTerm, setRamSearchTerm] = useState("")
  const [colorSearchTerm, setColorSearchTerm] = useState("")
  const [variantCategorySearchTerm, setVariantCategorySearchTerm] = useState("")

  // Lấy danh sách RAM
  const {
    data: rams = [],
    isLoading: isLoadingRams,
    error: ramsError,
  } = useQuery<IRam[]>({
    queryKey: ["rams"],
    queryFn: () => axios.get(`${API_BASE_URL}/rams`).then((res) => res.data),
  })

  // Lấy danh sách Color
  const {
    data: colors = [],
    isLoading: isLoadingColors,
    error: colorsError,
  } = useQuery<IColor[]>({
    queryKey: ["colors"],
    queryFn: () => axios.get(`${API_BASE_URL}/colors`).then((res) => res.data),
  })

  // Lấy danh sách VariantCategory
  const {
    data: variantCategories = [],
    isLoading: isLoadingVariantCategories,
    error: variantCategoriesError,
  } = useQuery<IVariantCategory[]>({
    queryKey: ["variantCategories"],
    queryFn: () => axios.get(`${API_BASE_URL}/variant-category`).then((res) => res.data),
  })

  // Xóa RAM
  const delRamMut = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_BASE_URL}/rams/${id}`),
    onSuccess: () => {
      message.success("Xóa RAM thành công.")
      queryClient.invalidateQueries({ queryKey: ["rams"] })
    },
    onError: (error: any) => {
      message.error(`Xóa RAM thất bại: ${error.message}`)
    },
  })

  // Xóa Color
  const delColorMut = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_BASE_URL}/colors/${id}`),
    onSuccess: () => {
      message.success("Xóa màu thành công.")
      queryClient.invalidateQueries({ queryKey: ["colors"] })
    },
    onError: (error: any) => {
      message.error(`Xóa màu thất bại: ${error.message}`)
    },
  })

  // Xóa VariantCategory
  const delVariantCategoryMut = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_BASE_URL}/variant-category/${id}`),
    onSuccess: () => {
      message.success("Xóa danh mục biến thể thành công.")
      queryClient.invalidateQueries({ queryKey: ["variantCategories"] })
    },
    onError: (error: any) => {
      message.error(`Xóa danh mục biến thể thất bại: ${error.message}`)
    },
  })

  // Lọc dữ liệu RAM dựa trên từ khóa tìm kiếm
  const filteredRams = useMemo(() => {
    return rams.filter((ram) => ram.size.toLowerCase().includes(ramSearchTerm.toLowerCase()))
  }, [rams, ramSearchTerm])

  // Lọc dữ liệu Màu sắc dựa trên từ khóa tìm kiếm
  const filteredColors = useMemo(() => {
    return colors.filter((color) => color.name.toLowerCase().includes(colorSearchTerm.toLowerCase()))
  }, [colors, colorSearchTerm])

  // Lọc dữ liệu Danh mục biến thể dựa trên từ khóa tìm kiếm
  const filteredVariantCategories = useMemo(() => {
    return variantCategories.filter((category) =>
      category.name.toLowerCase().includes(variantCategorySearchTerm.toLowerCase()),
    )
  }, [variantCategories, variantCategorySearchTerm])

  // Hàm render bảng RAM
  const renderRamTable = () => (
    <Table
      dataSource={filteredRams}
      columns={[
        {
          title: "Dung lượng",
          dataIndex: "size",
          key: "size",
        },
        {
          title: "Hành động",
          key: "action",
          render: (_, record: IRam) => (
            <div className="flex justify-end space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => (window.location.href = `/admin/ram/${record._id}`)}
              >
                Sửa
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: "Xác nhận xóa RAM",
                    content: "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?",
                    okText: "Xóa",
                    okType: "danger",
                    cancelText: "Hủy",
                    onOk: () => delRamMut.mutate(record._id!),
                  })
                }
              >
                Xóa
              </Button>
            </div>
          ),
        },
      ]}
      rowKey="_id"
      pagination={false}
      locale={{ emptyText: isLoadingRams ? "Đang tải RAM..." : ramsError ? `Lỗi tải RAM: ${ramsError.message}` : "Không tìm thấy RAM nào." }}
      style={{ maxHeight: "300px", overflowY: "auto" }} // Giới hạn chiều cao và thêm thanh cuộn
    />
  )

  // Hàm render bảng Màu sắc
  const renderColorTable = () => (
    <Table
      dataSource={filteredColors}
      columns={[
        {
          title: "Tên màu",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Hành động",
          key: "action",
          render: (_, record: IColor) => (
            <div className="flex justify-end space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => (window.location.href = `/admin/color/${record._id}`)}
              >
                Sửa
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: "Xác nhận xóa màu",
                    content: "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?",
                    okText: "Xóa",
                    okType: "danger",
                    cancelText: "Hủy",
                    onOk: () => delColorMut.mutate(record._id!),
                  })
                }
              >
                Xóa
              </Button>
            </div>
          ),
        },
      ]}
      rowKey="_id"
      pagination={false}
      locale={{ emptyText: isLoadingColors ? "Đang tải màu sắc..." : colorsError ? `Lỗi tải màu sắc: ${colorsError.message}` : "Không tìm thấy màu sắc nào." }}
      style={{ maxHeight: "300px", overflowY: "auto" }} // Giới hạn chiều cao và thêm thanh cuộn
    />
  )

  // Hàm render bảng Danh mục biến thể
  const renderVariantCategoryTable = () => (
    <Table
      dataSource={filteredVariantCategories}
      columns={[
        {
          title: "Tên danh mục biến thể",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Hành động",
          key: "action",
          render: (_, record: IVariantCategory) => (
            <div className="flex justify-end space-x-2">
              <Button
                icon={<EditOutlined />}
                onClick={() => (window.location.href = `/admin/categoryVariant/${record._id}`)}
              >
                Sửa
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: "Xác nhận xóa danh mục biến thể",
                    content: "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?",
                    okText: "Xóa",
                    okType: "danger",
                    cancelText: "Hủy",
                    onOk: () => delVariantCategoryMut.mutate(record._id!),
                  })
                }
              >
                Xóa
              </Button>
            </div>
          ),
        },
      ]}
      rowKey="_id"
      pagination={false}
      locale={{ emptyText: isLoadingVariantCategories ? "Đang tải danh mục biến thể..." : variantCategoriesError ? `Lỗi tải danh mục biến thể: ${variantCategoriesError.message}` : "Không tìm thấy danh mục biến thể nào." }}
      style={{ maxHeight: "300px", overflowY: "auto" }} // Giới hạn chiều cao và thêm thanh cuộn
    />
  )

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold mb-4 text-green-600">Quản lý danh mục biến thể sản phẩm</h2>
      <p className="text-gray-500">
        Quản lý RAM, màu sắc và danh mục biến thể của sản phẩm. Xem, chỉnh sửa và xóa thông tin một cách dễ dàng.
      </p>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Card Quản lý RAM */}
        <div className="rounded-xl border bg-white text-gray-900 shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight text-xl">Quản lý RAM</h3>
            <p className="text-sm text-gray-500">Thêm, sửa, xóa dung lượng RAM.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Button
                type="primary"
                onClick={() => (window.location.href = "/admin/ram/add")}
                className="bg-blue-600 hover:bg-blue-700/90"
              >
                Thêm RAM mới
              </Button>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Tìm kiếm RAM..."
                  value={ramSearchTerm}
                  onChange={(e) => setRamSearchTerm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            {renderRamTable()}
          </div>
        </div>

        {/* Card Quản lý Màu sắc */}
        <div className="rounded-xl border bg-white text-gray-900 shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight text-xl">Quản lý Màu sắc</h3>
            <p className="text-sm text-gray-500">Thêm, sửa, xóa các tùy chọn màu sắc.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Button
                type="primary"
                onClick={() => (window.location.href = "/admin/color/add")}
                className="bg-blue-600 hover:bg-blue-700/90"
              >
                Thêm màu mới
              </Button>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Tìm kiếm màu..."
                  value={colorSearchTerm}
                  onChange={(e) => setColorSearchTerm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            {renderColorTable()}
          </div>
        </div>

        {/* Card Quản lý Danh mục biến thể */}
        <div className="rounded-xl border bg-white text-gray-900 shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight text-xl">Quản lý Danh mục biến thể</h3>
            <p className="text-sm text-gray-500">Thêm, sửa, xóa các danh mục biến thể.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Button
                type="primary"
                onClick={() => (window.location.href = "/admin/categoryVariant/add")}
                className="bg-blue-600 hover:bg-blue-700/90"
              >
                Thêm danh mục biến thể mới
              </Button>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Tìm kiếm danh mục biến thể..."
                  value={variantCategorySearchTerm}
                  onChange={(e) => setVariantCategorySearchTerm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
            {renderVariantCategoryTable()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VariantList