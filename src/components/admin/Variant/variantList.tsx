"use client" // Đảm bảo đây là một Client Component

import type React from "react"

import { useState, useMemo } from "react"
// import { useRouter } from "next/navigation" // Đã bỏ useRouter như yêu cầu
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Search } from "lucide-react" // Icon tìm kiếm từ Lucide React

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
  // const router = useRouter() // Đã bỏ useRouter như yêu cầu
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
      window.alert("Xóa RAM thành công.") // Sử dụng alert thay cho toast
      queryClient.invalidateQueries({ queryKey: ["rams"] })
    },
    onError: (error: any) => {
      window.alert(`Xóa RAM thất bại: ${error.message}`) // Sử dụng alert thay cho toast
    },
  })

  // Xóa Color
  const delColorMut = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_BASE_URL}/colors/${id}`),
    onSuccess: () => {
      window.alert("Xóa màu thành công.")
      queryClient.invalidateQueries({ queryKey: ["colors"] })
    },
    onError: (error: any) => {
      window.alert(`Xóa màu thất bại: ${error.message}`)
    },
  })

  // Xóa VariantCategory
  const delVariantCategoryMut = useMutation({
    mutationFn: (id: string) => axios.delete(`${API_BASE_URL}/variant-category/${id}`),
    onSuccess: () => {
      window.alert("Xóa danh mục biến thể thành công.")
      queryClient.invalidateQueries({ queryKey: ["variantCategories"] })
    },
    onError: (error: any) => {
      window.alert(`Xóa danh mục biến thể thất bại: ${error.message}`)
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
    <table className="w-full caption-bottom text-sm">
      <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">
            Dung lượng
          </th>
          <th className="h-12 px-4 text-right align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">
            Hành động
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {isLoadingRams ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center">
              Đang tải RAM...
            </td>
          </tr>
        ) : ramsError ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center text-red-500">
              Lỗi tải RAM: {ramsError.message}
            </td>
          </tr>
        ) : filteredRams.length === 0 ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center text-gray-500">
              Không tìm thấy RAM nào.
            </td>
          </tr>
        ) : (
          filteredRams.map((ram) => (
            <tr key={ram._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle font-medium">{ram.size}</td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                    onClick={() => (window.location.href = `/admin/ram/${ram._id}`)} // Thay thế router.push
                  >
                    Sửa
                  </button>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-white hover:bg-red-600/90 h-9 px-3"
                    onClick={() => {
                      if (window.confirm("Xác nhận xóa RAM? Hành động này không thể hoàn tác.")) {
                        delRamMut.mutate(ram._id!)
                      }
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )

  // Hàm render bảng Màu sắc
  const renderColorTable = () => (
    <table className="w-full caption-bottom text-sm">
      <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">
            Tên màu
          </th>
          <th className="h-12 px-4 text-right align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">
            Hành động
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {isLoadingColors ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center">
              Đang tải màu sắc...
            </td>
          </tr>
        ) : colorsError ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center text-red-500">
              Lỗi tải màu sắc: {colorsError.message}
            </td>
          </tr>
        ) : filteredColors.length === 0 ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center text-gray-500">
              Không tìm thấy màu sắc nào.
            </td>
          </tr>
        ) : (
          filteredColors.map((color) => (
            <tr key={color._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle font-medium">{color.name}</td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                    onClick={() => (window.location.href = `/admin/color/${color._id}`)} // Thay thế router.push
                  >
                    Sửa
                  </button>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-white hover:bg-red-600/90 h-9 px-3"
                    onClick={() => {
                      if (window.confirm("Xác nhận xóa màu? Hành động này không thể hoàn tác.")) {
                        delColorMut.mutate(color._id!)
                      }
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )

  // Hàm render bảng Danh mục biến thể
  const renderVariantCategoryTable = () => (
    <table className="w-full caption-bottom text-sm">
      <thead className="[&_tr]:border-b">
        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
          <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">
            Tên danh mục biến thể
          </th>
          <th className="h-12 px-4 text-right align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0">
            Hành động
          </th>
        </tr>
      </thead>
      <tbody className="[&_tr:last-child]:border-0">
        {isLoadingVariantCategories ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center">
              Đang tải danh mục biến thể...
            </td>
          </tr>
        ) : variantCategoriesError ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center text-red-500">
              Lỗi tải danh mục biến thể: {variantCategoriesError.message}
            </td>
          </tr>
        ) : filteredVariantCategories.length === 0 ? (
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td colSpan={2} className="p-4 align-middle text-center text-gray-500">
              Không tìm thấy danh mục biến thể nào.
            </td>
          </tr>
        ) : (
          filteredVariantCategories.map((category) => (
            <tr
              key={category._id}
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td className="p-4 align-middle font-medium">{category.name}</td>
              <td className="p-4 align-middle text-right">
                <div className="flex justify-end space-x-2">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-gray-100 hover:text-gray-900 h-9 px-3"
                    onClick={() => (window.location.href = `/admin/categoryVariant/${category._id}`)} // Thay thế router.push
                  >
                    Sửa
                  </button>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-500 text-white hover:bg-red-600/90 h-9 px-3"
                    onClick={() => {
                      if (window.confirm("Xác nhận xóa danh mục biến thể? Hành động này không thể hoàn tác.")) {
                        delVariantCategoryMut.mutate(category._id!)
                      }
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
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
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700/90 h-10 px-4 py-2"
                onClick={() => (window.location.href = "/admin/ram/add")} // Thay thế router.push
              >
                Thêm RAM mới
              </button>
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
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700/90 h-10 px-4 py-2"
                onClick={() => (window.location.href = "/admin/color/add")} // Thay thế router.push
              >
                Thêm màu mới
              </button>
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
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700/90 h-10 px-4 py-2"
                onClick={() => (window.location.href = "/admin/categoryVariant/add")} // Thay thế router.push
              >
                Thêm danh mục biến thể mới
              </button>
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
