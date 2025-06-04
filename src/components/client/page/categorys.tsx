import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { IProduct } from '../../../interface/product'
import { ICategory } from '../../../interface/category'
import '../../../style/global.css'
import BannerClient from "../componentChild/Home/banner"

const Categorys = () => {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)

  // Lấy danh sách danh mục
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/category')).data
  })

  // Lấy danh sách sản phẩm
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/products')).data
  })

  // Debug dữ liệu
  React.useEffect(() => {
    console.log('Selected Category ID:', selectedCategoryId);
    console.log('Categories:', categories);
    console.log('Products:', products);
  }, [selectedCategoryId, categories, products]);

  const scrollLeft = () => {
    const container = document.getElementById('scroll-container')
    if (container) container.scrollLeft -= 200
  }

  const scrollRight = () => {
    const container = document.getElementById('scroll-container')
    if (container) container.scrollLeft += 200
  }

  // Lọc sản phẩm theo danh mục
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    if (!selectedCategoryId) return products;
    
    const filtered = products.filter((product: IProduct) => {
      console.log('Product:', product.name, 'Category:', product.danhmuc, 'Selected:', selectedCategoryId);
      return product.danhmuc === selectedCategoryId;
    });
    
    console.log('Filtered Products:', filtered);
    return filtered;
  }, [products, selectedCategoryId]);

  // Lấy tên danh mục đã chọn
  const selectedCategoryName = React.useMemo(() => {
    if (!selectedCategoryId || !categories) return '';
    const category = categories.find((cat: ICategory) => cat._id === selectedCategoryId);
    console.log('Selected Category:', category);
    return category ? category.name : '';
  }, [selectedCategoryId, categories]);

  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
       {/* Banner */}
        <BannerClient />
      {/* Danh mục */}
      <div className="w-full flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-bold my-4 text-center">Danh mục</h2>

        <div className="relative w-full px-4 overflow-hidden">
          {/* Nút trái */}
          <button
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 text-gray-600 rounded-full w-8 h-8 text-sm md:w-9 md:h-9 md:text-lg flex items-center justify-center hover:bg-gray-100 z-10"
            onClick={scrollLeft}
          >
            &#8592;
          </button>

          {/* Container cuộn danh mục */}
          <div
            id="scroll-container"
            className="flex gap-3 overflow-x-auto scroll-smooth px-10 py-2 no-scrollbar"
          >
            {categories?.map((cat: ICategory) => (
              <div
                key={cat._id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  console.log('Category clicked:', cat._id);
                  setSelectedCategoryId(cat._id);
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className={`w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-cover rounded-lg border transition-transform hover:scale-105 ${
                    selectedCategoryId === cat._id ? 'ring-4 ring-blue-500' : ''
                  }`}
                />
                <span className="mt-2 text-sm text-gray-600">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Nút phải */}
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white border border-gray-300 text-gray-600 rounded-full w-8 h-8 text-sm md:w-9 md:h-9 md:text-lg flex items-center justify-center hover:bg-gray-100 z-10"
            onClick={scrollRight}
          >
            &#8594;
          </button>
        </div>
      </div>

      {/* Nút hiện tất cả sản phẩm */}
      {selectedCategoryId && (
        <div className="mt-2 text-center">
          <button
            onClick={() => {
              console.log('Reset category selection');
              setSelectedCategoryId(null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Hiện tất cả sản phẩm
          </button>
        </div>
      )}

      {/* Tiêu đề sản phẩm */}
      <div className="mb-2 text-center">
        <h2 className="text-xl md:text-2xl font-bold my-4">
          {selectedCategoryId ? `Sản phẩm ${selectedCategoryName}` : 'Tất cả sản phẩm'}
        </h2>
        <p className="text-gray-600">
          {selectedCategoryId 
            ? `Hiển thị ${filteredProducts.length} sản phẩm trong danh mục ${selectedCategoryName}`
            : `Hiển thị ${filteredProducts.length} sản phẩm`}
        </p>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-[1400px] mx-auto p-4">
        {filteredProducts?.map((product: IProduct) => (
          <div
            key={product._id}
            className="group bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1"
          >
            {/* Ảnh sản phẩm */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[120px] sm:h-[160px] md:h-[200px] object-cover"
            />

            {/* Nội dung */}
            <div className="p-3 flex flex-col gap-2">
              {/* Tên sản phẩm */}
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 line-clamp-2">
                {product.name}
              </h3>

              {/* Giá */}
              <p className="text-sm sm:text-lg md:text-xl text-red-600 font-bold">
                {product.price.toLocaleString()} VND
              </p>

              {/* Trạng thái */}
              <span className={`text-sm px-2 py-1 rounded-full ${
                product.trangthai === 'còn hàng' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.trangthai}
              </span>

              {/* Nút thêm vào giỏ hàng */}
              <button className="text-xs sm:text-sm px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Thông báo khi không có sản phẩm */}
      {filteredProducts?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {selectedCategoryId 
              ? `Không tìm thấy sản phẩm nào trong danh mục ${selectedCategoryName}`
              : 'Không tìm thấy sản phẩm nào'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Categorys
