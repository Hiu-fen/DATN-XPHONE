import CategoryProductApw from "../componentChild/Home/ApwProduct ";
import BannerClient from "../componentChild/Home/banner"
import HotSaleSection from "../componentChild/Home/hotSale";
import CategoryProductIpad from "../componentChild/Home/iPadProduct";
import CategoryProductIphone from "../componentChild/Home/iPhoneProduct";
import ProductCategory from "../componentChild/Home/productCategory";
import News from "../componentChild/Home/news";

const Home = () => {
  return (
    <>
      <div className="w-full">
        {/* Banner */}
        <BannerClient />

        {/* Button Filter */}
        <div className="mx-24 flex space-x-4 py-8">
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
        <div className="mx-24 grid grid-cols-3 gap-4 pb-8">
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
        <CategoryProductIphone/>

        {/* iPad Section */}
        <CategoryProductIpad/>

        <div className="overflow-hidden relative bg-blue-50 py-10 px-5">
          <h2 className="text-center text-3xl font-semibold mb-10 text-gray-700">
            Thông tin sản phẩm
          </h2>

          <div className="flex justify-between items-center gap-6 mx-24">
            {/* Cột bên trái - thông tin sản phẩm */}
            <div className="w-1/2">
              <h3 className="text-red-600 text-xl mb-2">iPhone 15 – 15 Pro Max</h3>
              <h1 className="text-3xl font-bold mb-5 text-gray-800">
                iPhone 15 Pro Max sẽ có viền màn hình mỏng nhất thế giới.
              </h1>
              <p className="text-gray-600 text-base leading-relaxed mb-5">
                Theo Apple Insider, dữ kiện nhận bằng CAD (thiết kế có sự hỗ trợ của máy tính) rõ ràng cho thấy iPhone 15 Pro Max sẽ có viền mỏng hơn iPhone 14 Pro Max, mỏng hơn cả những mẫu điện thoại khác trên thị trường như Xiaomi 13 (1.81mm). iPhone 15 Pro Max sẽ phá kỷ lục độ mỏng viền hiện tại.
              </p>
              <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
                Xem thêm
              </button>
            </div>

            {/* Cột bên phải - ảnh sản phẩm */}
            <div className="w-1/2 flex justify-center">
              <img
                src="./src/assets/ip15.webp"
                alt="iPhone 15 Pro Max"
                className="max-w-xs rotate-[-30deg] object-cover floating-animation"
              />
            </div>
          </div>
        </div>

        <CategoryProductApw />

        <News />

        <div className="bg-[#f7f7f7] py-8 px-4  text-center">
          <h3 className="text-2xl md:text-3xl font-semibold mb-2">
            Đăng ký nhận tin từ XPhone
          </h3>
          <p className="text-gray-600 mb-6">
            Nhận thông tin sản phẩm mới nhất và các chương trình khuyến mãi.
          </p>

          <form className="max-w-xl mx-auto flex rounded-full overflow-hidden border border-gray-300 bg-white shadow-sm">
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              className="flex-grow px-5 py-2 text-base focus:outline-none"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-all"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Home