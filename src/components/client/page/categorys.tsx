import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { IProduct } from '../../../interface/product'
import { ICategory } from '../../../interface/category'
import '../../../style/global.css'

const Categorys = () => {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get('http://localhost:4000/category')).data
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:4000/products')).data
  })

  const scrollLeft = () => {
    const container = document.getElementById('scroll-container')
    if (container) container.scrollLeft -= 200
  }

  const scrollRight = () => {
    const container = document.getElementById('scroll-container')
    if (container) container.scrollLeft += 200
  }

  const filteredProducts = selectedCategoryId !== null
    ? products?.filter((p: IProduct) => p.danhmuc === selectedCategoryId)
    : products

  return (
<div className="w-full">
  {/* Banner */}
  <div className="w-full border h-[200px] md:h-[400px] flex justify-center items-center overflow-hidden">
    <img
      src="https://img.pikbest.com/origin/10/01/53/35bpIkbEsTBzN.png!w700wp"
      alt=""
      className="w-full h-full object-cover"
    />
  </div>

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
          <img
            key={cat._id}
            src={cat.image}
            alt={cat.name}
            onClick={() => setSelectedCategoryId(cat._id)}
            className={`w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-cover rounded-lg border cursor-pointer transition-transform hover:scale-105 ${
              selectedCategoryId === cat._id ? 'ring-4 ring-blue-500' : ''
            }`}
          />
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
        onClick={() => setSelectedCategoryId(null)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Hiện tất cả sản phẩm
      </button>
    </div>
  )}

  {/* Tiêu đề sản phẩm */}
  <div className="mb-2 text-center">
    <h2 className="text-xl md:text-2xl font-bold my-4 text-center">Sản phẩm</h2>
  </div>

  {/* Danh sách sản phẩm */}
<div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-[1400px] mx-auto p-2 box-border">
  {filteredProducts?.map((product: IProduct) => (
    <div
      key={product._id}
      className="group bg-white rounded-md shadow-sm border overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1"
    >
      {/* Ảnh sản phẩm */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-[120px] sm:h-[160px] md:h-[200px] object-cover"
      />

      {/* Nội dung */}
      <div className="p-2 flex flex-col gap-1 relative">
        {/* Tên sản phẩm to hơn */}
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </h3>

        {/* Giá to hơn */}
        <p className="text-sm sm:text-lg md:text-xl text-red-600 font-bold">
          {product.price.toLocaleString()} VND
        </p>

        {/* Nút chỉ hiện khi hover */}
        <button className="text-xs sm:text-sm px-3 py-[4px] bg-blue-600 text-white rounded hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Add to cart
        </button>
      </div>
    </div>
  ))}
</div>

</div>
  )
}

export default Categorys
