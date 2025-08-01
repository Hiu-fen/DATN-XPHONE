"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type { IProduct } from "../../../../interface/product"
import type { ICategory } from "../../../../interface/category"
import { Card, Row, Col, Typography, Spin, Select, Input, Space, InputNumber, Button, Dropdown, Tag } from "antd"
import { Link } from "react-router-dom"
import { useState, useMemo, useEffect } from "react"
import {
  FilterOutlined,
  SearchOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ClearOutlined,
  DollarOutlined,
} from "@ant-design/icons"
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const ramOptions = ["16GB", "32GB", "128GB", "256GB", "512GB", "1TB"]

  // Fetch danh sách sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/products")
      const data = response.data
      // Kiểm tra dữ liệu sản phẩm
      if (data.some((product: IProduct) => !product._id)) {
        console.warn("Cảnh báo: Một số sản phẩm không có _id hợp lệ", data)
      }
      return data
    },
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

  // Lọc sản phẩm
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

  // Count active filters
  const activeFiltersCount = [
    selectedCategory,
    searchText,
    minPrice,
    maxPrice,
    selectedRams.length > 0 ? selectedRams : null,
  ].filter(Boolean).length

  // Enhanced dropdown bộ lọc
  const filterDropdown = (
    <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/30 w-[400px] animate-in slide-in-from-top-2 duration-300">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Title level={4} className="text-gray-800 mb-0 flex items-center">
            <FilterOutlined className="mr-2 text-blue-600" />
            Bộ lọc nâng cao
          </Title>
          {activeFiltersCount > 0 && (
            <Tag color="blue" className="rounded-full px-3 py-1">
              {activeFiltersCount} bộ lọc
            </Tag>
          )}
        </div>
      </div>

      <Space direction="vertical" size="large" className="w-full">
        {/* Khoảng giá */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <DollarOutlined className="text-white text-sm" />
            </div>
            <div>
              <Text strong className="text-gray-800 text-base block">
                Khoảng giá
              </Text>
              <Text className="text-gray-500 text-xs">Lọc theo mức giá mong muốn</Text>
            </div>
          </div>
          <Space className="w-full">
            <InputNumber
              placeholder="Giá từ"
              min={0}
              value={minPrice}
              onChange={setMinPrice}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
              className="w-full rounded-xl"
              size="large"
              prefix="₫"
            />
            <div className="text-gray-400 text-lg font-bold">~</div>
            <InputNumber
              placeholder="Giá đến"
              min={0}
              value={maxPrice}
              onChange={setMaxPrice}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
              className="w-full rounded-xl"
              size="large"
              prefix="₫"
            />
          </Space>
        </div>

        {/* RAM */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              {/* <MemoryOutlined className="text-white text-sm" /> */}
            </div>
            <div>
              <Text strong className="text-gray-800 text-base block">
                Bộ nhớ RAM
              </Text>
              <Text className="text-gray-500 text-xs">Chọn dung lượng RAM phù hợp</Text>
            </div>
          </div>
          <Select
            mode="multiple"
            placeholder="Chọn dung lượng RAM"
            value={selectedRams}
            onChange={setSelectedRams}
            className="w-full"
            size="large"
            allowClear
            maxTagCount="responsive"
          >
            {ramOptions.map((ram) => (
              <Option key={ram} value={ram}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{ram}</span>
                  <Tag color="green" className="text-xs px-2 py-0.5">
                    RAM
                  </Tag>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {/* Tìm kiếm */}
        <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <SearchOutlined className="text-white text-sm" />
            </div>
            <div>
              <Text strong className="text-gray-800 text-base block">
                Tìm kiếm sản phẩm
              </Text>
              <Text className="text-gray-500 text-xs">Nhập tên sản phẩm để tìm kiếm</Text>
            </div>
          </div>
          <Search
            placeholder="Nhập tên sản phẩm..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-xl"
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
        </div>

        {/* Nút xóa bộ lọc */}
        <Button
          type="dashed"
          onClick={clearAllFilters}
          icon={<ClearOutlined />}
          className="w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:text-red-600 transition-all duration-300 h-12 text-base font-medium"
          size="large"
          disabled={activeFiltersCount === 0}
        >
          Xóa tất cả bộ lọc ({activeFiltersCount})
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center space-y-6 z-10">
          <div className="relative">
            <Spin size="large" />
            <div className="absolute inset-0 animate-ping">
              <Spin size="large" />
            </div>
          </div>
          <div className="space-y-2">
            <Text className="text-xl font-semibold text-gray-700 animate-pulse">Đang tải sản phẩm...</Text>
            <Text className="text-sm text-gray-500">Vui lòng chờ trong giây lát</Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float-delayed"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header với animation */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-1000">
          <Title
            level={1}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient"
          >
            Cửa hàng điện thoại
          </Title>
          <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập điện thoại thông minh mới nhất với công nghệ tiên tiến
          </Text>
        </div>

        {/* Enhanced Bộ lọc */}
        <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl mb-8 border border-white/40 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <Space direction="vertical" size="large" className="w-full">
            {/* Danh mục sản phẩm */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📱</span>
                  </div>
                  <div>
                    <Text strong className="text-xl text-gray-800 block">
                      Danh mục sản phẩm
                    </Text>
                    <Text className="text-gray-500 text-sm">Chọn danh mục để lọc sản phẩm</Text>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <Tag color="blue" className="rounded-full px-3 py-1 animate-pulse">
                      {activeFiltersCount} bộ lọc đang áp dụng
                    </Tag>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-grow">
                  <Space wrap className="gap-3">
                    <Button
                      type={selectedCategory === null ? "primary" : "default"}
                      onClick={() => handleCategoryChange(null)}
                      className={`px-6 py-2 h-auto rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === null
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg hover:shadow-xl"
                          : "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                      size="large"
                    >
                      <span className="flex items-center space-x-2">
                        <span>🏪</span>
                        <span>Tất cả</span>
                      </span>
                    </Button>

                    {categories?.map((category: ICategory, index: number) => (
                      <Button
                        key={category._id}
                        type={selectedCategory === category._id ? "primary" : "default"}
                        onClick={() => handleCategoryChange(category._id)}
                        className={`px-6 py-2 h-auto rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 animate-in fade-in slide-in-from-left delay-${index * 100} ${
                          selectedCategory === category._id
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg hover:shadow-xl"
                            : "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
                        }`}
                        size="large"
                      >
                        <span className="flex items-center space-x-2">
                          <span>📱</span>
                          <span>{category.name}</span>
                        </span>
                      </Button>
                    ))}
                  </Space>
                </div>

                <div className="flex items-center">
                  <Dropdown
                    popupRender={() => filterDropdown}
                    trigger={["hover"]}
                    placement="bottomRight"
                    onOpenChange={setIsFilterOpen}
                  >
                    <Button
                      type="default"
                      icon={<FilterOutlined className={isFilterOpen ? "animate-spin" : ""} />}
                      className={`px-6 py-2 h-auto rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        activeFiltersCount > 0
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg"
                          : "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 hover:shadow-md"
                      }`}
                      size="large"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Bộ lọc nâng cao</span>
                        {activeFiltersCount > 0 && (
                          <Tag color="white" className="ml-1 text-xs px-2 py-0.5">
                            {activeFiltersCount}
                          </Tag>
                        )}
                      </span>
                    </Button>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Space>
        </div>

        {/* Enhanced Thống kê sản phẩm */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
          <div className="bg-gradient-to-r from-white/60 to-blue-50/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <Text className="text-gray-700 font-medium">
                  {selectedCategory
                    ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục "${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}"`
                    : `Hiển thị ${filteredProducts.length} sản phẩm`}
                </Text>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  type="link"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-800 font-medium hover:bg-red-50 rounded-lg px-3 py-1 transition-all duration-200"
                  icon={<ClearOutlined />}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Danh sách sản phẩm */}
        <Row gutter={[20, 20]}>
          {filteredProducts.map((product: IProduct, index: number) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product._id || `product-${index}`}>
              <div
                className={`group relative animate-in fade-in slide-in-from-bottom duration-500 delay-${Math.min(index * 100, 800)}`}
                onMouseEnter={() => setHoveredProduct(product._id || `product-${index}`)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Link to={`/detail/${product._id || `product-${index}`}`}>
                  <Card
                    hoverable
                    className="h-full transition-all duration-500 hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden group-hover:-translate-y-2 group-hover:rotate-1 transform-gpu"
                    cover={
                      <div className="relative h-52 overflow-hidden">
                        <img
                          alt={product.name}
                          src={product.image || "/placeholder.svg"}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                        />

                        {/* Enhanced overlay */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-500 ${
                            hoveredProduct === (product._id || `product-${index}`) ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              className="bg-white/95 backdrop-blur-sm border-0 text-gray-800 hover:bg-white px-6 py-2 h-auto rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                              size="middle"
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>

                        {/* Floating price tag */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                            HOT
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div className="p-4">
                      <Title
                        level={5}
                        className="mb-3 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300 font-semibold text-base leading-tight"
                      >
                        {product.name}
                      </Title>

                      <div className="space-y-2">
                        <Text className="block text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                          {Number(product.price).toLocaleString("vi-VN")} ₫
                        </Text>
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Tag color="blue" className="rounded-full text-xs px-2 py-0.5">
                              RAM: {product.variants[0].ram}
                            </Tag>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </Col>
          ))}
        </Row>

        {/* Enhanced Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-white/40">
              <div className="text-6xl mb-6 animate-bounce">📱</div>
              <Title level={3} className="text-gray-800 mb-4">
                Không tìm thấy sản phẩm
              </Title>
              <Text className="text-gray-600 text-base mb-6">
                {selectedCategory
                  ? `Không có sản phẩm nào trong danh mục "${categories?.find((c: ICategory) => c._id === selectedCategory)?.name}"`
                  : "Không có sản phẩm phù hợp với bộ lọc của bạn"}
              </Text>
              <Button
                type="primary"
                size="large"
                onClick={clearAllFilters}
                className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-2xl px-8 py-3 h-auto font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                icon={<ClearOutlined />}
              >
                Xem tất cả sản phẩm
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Scroll to Top Button */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
          showScrollTop
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-16 scale-75 pointer-events-none"
        }`}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          size="large"
          onClick={scrollToTop}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none"
        />
      </div>
    </div>
  )
}

// Custom CSS animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(8px) rotate(-1deg); }
    66% { transform: translateY(-12px) rotate(1deg); }
  }
  
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(0.5deg); }
  }
  
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
  .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
  .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% 200%; }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}

export default ProductPage