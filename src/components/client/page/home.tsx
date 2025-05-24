import BannerClient from "../componentChild/Home/banner"
import HotSaleSection from "../componentChild/Home/hotSale";
import ProductCategory from "../componentChild/Home/productCategory";

const Home = () => {
  return (
    <>
      <div className="w-full">
        {/* Banner */}
        <BannerClient />

        {/* Button Filter */}
        <div className="mx-36 flex space-x-4 py-8">
          <button className="flex-1 px-4 py-4 rounded-full border-gray-400 border hover:shadow transition-shadow duration-300">
            Vận chuyển
          </button>
          <button className="flex-1 px-4 py-4 rounded-full border-gray-400 border hover:shadow transition-shadow duration-300">
            Quà tặng
          </button>
          <button className="flex-1 px-4 py-4 rounded-full border-gray-400 border hover:shadow transition-shadow duration-300">
            Chứng nhận
          </button>
          <button className="flex-1 px-4 py-4 rounded-full border-gray-400 border hover:shadow transition-shadow duration-300">
            Hỗ trợ
          </button>
        </div>

        {/* Small Banner */}
        <div className="mx-36 grid grid-cols-3 gap-4 pb-8">
          <div className="bg-gray-300 flex items-center justify-center rounded-3xl transition-transform duration-300 hover:-translate-y-2">
            <img
              src="./src/assets/banner1.webp"
              alt="Banner 1"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
          <div className="bg-gray-300 flex items-center justify-center rounded-3xl transition-transform duration-300 hover:-translate-y-2">
            <img
              src="./src/assets/banner2.webp"
              alt="Banner 2"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
          <div className="bg-gray-300 flex items-center justify-center rounded-3xl transition-transform duration-300 hover:-translate-y-2">
            <img
              src="./src/assets/banner3.webp"
              alt="Banner 3"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
        </div>

        {/* Hot Sale Cuối Tuần */}
        <HotSaleSection />

        {/* Danh mục sản phẩm */}
        <ProductCategory />

        {/* iPhone Section */}
        <div className="py-8 px-4">
          <h3 className="text-lg font-bold mb-4">iPhone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded shadow p-2">
                <div className="bg-gray-200 h-32 mb-2" />
                <div className="font-bold text-sm">iPhone 12 mini 128GB</div>
                <div className="text-red-500 font-semibold">Giá: 14.990.000đ</div>
                <div className="text-gray-500 text-xs line-through">19.990.000đ</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button className="border px-4 py-2 rounded">Xem tất cả</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home