import { FaArrowRight } from "react-icons/fa";

const News = () => {
  return (
    <div className="py-12 mx-4 lg:mx-24 bg-white">
      <h3 className="text-center text-3xl font-bold mb-10">TIN TỨC CÔNG NGHỆ</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div
            className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
          >
            <div className="overflow-hidden group">
              <img
                src="./src/assets/news1.webp"
                alt="Tin tức công nghệ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4">
              <h4 className="text-lg font-semibold mb-2 hover:text-red-600 transition-colors cursor-pointer">
                iPhone 12 mini 128GB giảm giá mạnh
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Apple đang tiến hành đợt giảm giá đặc biệt dành cho iPhone 12 mini 128GB trong thời gian giới hạn...
              </p>
              <button className="text-red-600 hover:text-red-800 text-sm inline-flex items-center gap-1 transition">
                Xem thêm <FaArrowRight className="text-xs mt-[2px]" />
              </button>
            </div>
          </div>

          <div
            className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
          >
            <div className="overflow-hidden group">
              <img
                src="./src/assets/news2.webp"
                alt="Tin tức công nghệ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-4">
              <h4 className="text-lg font-semibold mb-2 hover:text-red-600 transition-colors cursor-pointer">
                iPhone 12 mini 128GB giảm giá mạnh
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Apple đang tiến hành đợt giảm giá đặc biệt dành cho iPhone 12 mini 128GB trong thời gian giới hạn...
              </p>
              <button className="text-red-600 hover:text-red-800 text-sm inline-flex items-center gap-1 transition">
                Xem thêm <FaArrowRight className="text-xs mt-[2px]" />
              </button>
            </div>
          </div>

          <div
            className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
          >
            <div className="overflow-hidden group">
              <img
                src="./src/assets/news3.webp"
                alt="Tin tức công nghệ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-4">
              <h4 className="text-lg font-semibold mb-2 hover:text-red-600 transition-colors cursor-pointer">
                iPhone 12 mini 128GB giảm giá mạnh
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Apple đang tiến hành đợt giảm giá đặc biệt dành cho iPhone 12 mini 128GB trong thời gian giới hạn...
              </p>
              <button className="text-red-600 hover:text-red-800 text-sm inline-flex items-center gap-1 transition">
                Xem thêm <FaArrowRight className="text-xs mt-[2px]" />
              </button>
            </div>
          </div>
          
          <div
            className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
          >
            <div className="overflow-hidden group">
              <img
                src="./src/assets/news4.webp"
                alt="Tin tức công nghệ"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="p-4">
              <h4 className="text-lg font-semibold mb-2 hover:text-red-600 transition-colors cursor-pointer">
                iPhone 12 mini 128GB giảm giá mạnh
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Apple đang tiến hành đợt giảm giá đặc biệt dành cho iPhone 12 mini 128GB trong thời gian giới hạn...
              </p>
              <button className="text-red-600 hover:text-red-800 text-sm inline-flex items-center gap-1 transition">
                Xem thêm <FaArrowRight className="text-xs mt-[2px]" />
              </button>
            </div>
          </div>
      </div>

      <div className="text-center mt-10">
        <button className="px-5 py-2 border border-black rounded-md inline-flex items-center gap-2 hover:bg-red-700 hover:border-red-700 hover:text-white transition">
          Xem tất cả
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default News;
