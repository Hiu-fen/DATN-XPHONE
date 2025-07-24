"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type { IProduct } from "../../../../interface/product"
import type { ICategory } from "../../../../interface/category"
import { Card, Row, Col, Typography, Spin, Select, Input, Space, InputNumber, Button, Dropdown } from "antd"
import { Link } from "react-router-dom"
import { useState, useMemo, useEffect } from "react"
import { FilterOutlined, SearchOutlined, EyeOutlined, ArrowUpOutlined } from "@ant-design/icons"
import socket from "../../../../socket"

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

const ProductPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [selectedRams, setSelectedRams] = useState<string[]>([])
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const ramOptions = ["4GB", "6GB", "8GB", "12GB", "16GB"]

  // Fetch danh sách sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await axios.get("http://localhost:5000/api/products")).data,
  })

  // Fetch danh sách danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await axios.get("http://localhost:5000/api/category")).data,
  })

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Lọc sản phẩm (đã bỏ lọc theo stock)
  const filteredProducts = useMemo(() => {
    if (!products) return []
    let filtered = products

    if (selectedCategory) {
      filtered = filtered.filter((product: IProduct) => product.danhmuc === selectedCategory)
    }

    if (searchText) {
      filtered = filtered.filter((product: IProduct) => product.name.toLowerCase().includes(searchText.toLowerCase()))
    }

    if (minPrice !== null || maxPrice !== null) {
      filtered = filtered.filter((product: IProduct) => {
        const price = Number(product.price)
        if (minPrice !== null && maxPrice !== null) {
          return price >= minPrice && price <= maxPrice
        } else if (minPrice !== null) {
          return price >= minPrice
        } else if (maxPrice !== null) {
          return price <= maxPrice
        }
        return true
      })
    }

    if (selectedRams.length > 0) {
      filtered = filtered.filter((product: IProduct) => {
        if (!product.variants || product.variants.length === 0) return false
        return product.variants.some((variant) => selectedRams.includes(variant.ram.toUpperCase()))
      })
    }

    return filtered
  }, [products, selectedCategory, searchText, minPrice, maxPrice, selectedRams])

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value)
    setSearchText("")
    setMinPrice(null)
    setMaxPrice(null)
    setSelectedRams([])
  }

  const clearAllFilters = () => {
    setSelectedCategory(null)
    setSearchText("")
    setMinPrice(null)
    setMaxPrice(null)
    setSelectedRams([])
  }

  // Dropdown bộ lọc nâng cao
  const filterDropdown = (
    <div className="bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20 w-[350px]">
      <Space direction="vertical" size="large" className="w-full">
        {/* Khoảng giá */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <Text strong className="text-gray-700 text-sm">
              Khoảng giá
            </Text>
          </div>
          <Space className="w-full">
            <InputNumber
              placeholder="Giá từ"
              min={0}
              value={minPrice}
              onChange={setMinPrice}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
              className="w-full rounded-lg"
              size="middle"
            />
            <div className="text-gray-400 text-sm">-</div>
            <InputNumber
              placeholder="Giá đến"
              min={0}
              value={maxPrice}
              onChange={setMaxPrice}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
              className="w-full rounded-lg"
              size="middle"
            />
          </Space>
        </div>

        {/* RAM */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
            <Text strong className="text-gray-700 text-sm">
              Bộ nhớ RAM
            </Text>
          </div>
          <Select
            mode="multiple"
            placeholder="Chọn dung lượng RAM"
            value={selectedRams}
            onChange={setSelectedRams}
            className="w-full"
            size="middle"
            allowClear
          >
            {ramOptions.map((ram) => (
              <Option key={ram} value={ram}>
                <span className="text-sm">{ram}</span>
              </Option>
            ))}
          </Select>
        </div>

        {/* Tìm kiếm */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            <Text strong className="text-gray-700 text-sm">
              Tìm kiếm
            </Text>
          </div>
          <Search
            placeholder="Nhập tên sản phẩm..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-lg"
            size="middle"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
        </div>

        {/* Nút xóa bộ lọc */}
        <Button
          type="dashed"
          onClick={clearAllFilters}
          className="w-full rounded-lg border border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 text-sm"
          size="middle"
        >
          Xóa tất cả bộ lọc
        </Button>
      </Space>
    </div>
  )

  useEffect(() => {
    socket.on("productCreated", (newProduct) => {
      console.log("🟢 Sản phẩm mới:", newProduct)
    })

    socket.on("productUpdated", (updatedProduct) => {
      console.log("🟡 Sản phẩm được cập nhật:", updatedProduct)
    })

    socket.on("productDeleted", (deletedProductId) => {
      console.log("🔴 Sản phẩm bị xoá:", deletedProductId)
    })

    return () => {
      socket.off("productCreated")
      socket.off("productUpdated")
      socket.off("productDeleted")
    }
  }, [])

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spin size="large" />
          <Text className="text-base text-gray-600">Đang tải sản phẩm...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Title
            level={1}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3"
          >
            Cửa hàng điện thoại
          </Title>
          <Text className="text-base text-gray-600 max-w-xl mx-auto">
            Khám phá bộ sưu tập điện thoại thông minh mới nhất
          </Text>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white/70 backdrop-blur-lg p-5 rounded-xl shadow-lg mb-6 border border-white/30">
          <Space direction="vertical" size="middle" className="w-full">
            {/* Danh mục sản phẩm */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <Text strong className="text-lg text-gray-800">
                  Danh mục sản phẩm
                </Text>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-grow">
                  <Space wrap className="gap-2">
                    <Button
                      type={selectedCategory === null ? "primary" : "default"}
                      onClick={() => handleCategoryChange(null)}
                      className={`px-4 py-1.5 h-auto rounded-lg font-medium transition-all duration-200 text-sm ${
                        selectedCategory === null
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-md"
                          : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300"
                      }`}
                      size="middle"
                    >
                      Tất cả
                    </Button>

                    {categories?.map((category: ICategory) => (
                      <Button
                        key={category._id}
                        type={selectedCategory === category._id ? "primary" : "default"}
                        onClick={() => handleCategoryChange(category._id)}
                        className={`px-4 py-1.5 h-auto rounded-lg font-medium transition-all duration-200 text-sm ${
                          selectedCategory === category._id
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-md"
                            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300"
                        }`}
                        size="middle"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </Space>
                </div>

                <div className="flex items-center">
                  <Dropdown overlay={filterDropdown} trigger={["hover"]} placement="bottomRight">
                    <Button
                      type="default"
                      icon={<FilterOutlined />}
                      className="px-4 py-1.5 h-auto rounded-lg font-medium transition-all duration-200 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-600 text-sm"
                      size="middle"
                    >
                      Bộ lọc
                    </Button>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Space>
        </div>

        {/* Thống kê sản phẩm */}
        <div className="mb-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <div className="flex items-center justify-between">
              <Text className="text-gray-700 text-sm">
                {selectedCategory
                  ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục "${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}"`
                  : `Hiển thị ${filteredProducts.length} sản phẩm`}
              </Text>

              {(selectedCategory || searchText || minPrice || maxPrice || selectedRams.length > 0) && (
                <Button type="link" onClick={clearAllFilters} className="text-blue-600 hover:text-blue-800 text-sm p-0">
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product: IProduct) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
              <div
                className="group relative"
                onMouseEnter={() => setHoveredProduct(product._id ?? null)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link to={`/detail/${product._id}`}>
                  <Card
                    hoverable
                    className="h-full transition-all duration-300 hover:shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden group-hover:-translate-y-1"
                    cover={
                      <div className="relative h-48 overflow-hidden">
                        <img
                          alt={product.name}
                          src={product.image || "/placeholder.svg"}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        />

                        {/* Overlay nhẹ nhàng khi hover */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${
                            hoveredProduct === product._id ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              className="bg-white/90 backdrop-blur-sm border-0 text-gray-800 hover:bg-white px-4 py-1.5 h-auto rounded-lg text-sm font-medium shadow-sm"
                              size="small"
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className="p-3">
                      <Title
                        level={5}
                        className="mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 font-medium text-sm leading-snug"
                      >
                        {product.name}
                      </Title>

                      <div className="space-y-1">
                        <Text className="block text-lg font-bold text-red-600">
                          {Number(product.price).toLocaleString("vi-VN")} ₫
                        </Text>
                        {product.variants && product.variants.length > 0 && (
                          <Text className="text-xs text-gray-500">RAM: {product.variants[0].ram}</Text>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>
          ))}
        </Row>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-sm mx-auto border border-white/30">
              <div className="text-4xl mb-4">📱</div>
              <Title level={4} className="text-gray-800 mb-3">
                Không tìm thấy sản phẩm
              </Title>
              <Text className="text-gray-600 text-sm mb-4">
                {selectedCategory
                  ? `Không có sản phẩm nào trong danh mục "${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}"`
                  : "Không có sản phẩm phù hợp với bộ lọc"}
              </Text>
              <Button
                type="primary"
                size="middle"
                onClick={clearAllFilters}
                className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-lg px-6 py-1.5 h-auto text-sm font-medium shadow-md"
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          size="large"
          onClick={scrollToTop}
          className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        />
      </div>
    </div>
  )
}

export default ProductPage
