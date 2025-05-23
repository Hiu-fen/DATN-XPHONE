import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { IProduct } from '../../../interface/product'
import { Icatagory } from '../../../interface/category'

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
      <div className="w-full border h-[400px] flex justify-center items-center overflow-hidden">
        <img
          src="https://img.pikbest.com/origin/10/01/53/35bpIkbEsTBzN.png!w700wp"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="text-2xl font-bold my-4">Danh mục</h2>

      <div className="relative flex items-center overflow-hidden my-5 px-2">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-400 text-gray-600 rounded-full w-9 h-9 text-lg flex items-center justify-center hover:bg-gray-100 hover:border-gray-600 z-10"
          onClick={scrollLeft}
        >
          &#8592;
        </button>

        <div
          className="flex overflow-x-auto gap-3 scroll-smooth px-5"
          id="scroll-container"
        >
          {categories?.map((cat: Icatagory) => (
            <img
              key={cat.id}
              src={cat.image}
              alt={cat.name}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`w-[140px] h-[140px] object-cover rounded-lg border cursor-pointer transition-transform hover:scale-105 ${
                selectedCategoryId === cat.id ? 'ring-4 ring-blue-500' : ''
              }`}
            />
          ))}
        </div>

        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-400 text-gray-600 rounded-full w-9 h-9 text-lg flex items-center justify-center hover:bg-gray-100 hover:border-gray-600 z-10"
          onClick={scrollRight}
        >
          &#8594;
        </button>
      </div>

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

      <h2 className="text-2xl font-bold my-4">Sản phẩm</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-[1400px] mx-auto p-5 box-border">
        {filteredProducts?.map((product: IProduct) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-1"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[180px] object-cover"
            />
            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <p className="text-pink-600 font-bold">{product.price.toLocaleString()} VND</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categorys
