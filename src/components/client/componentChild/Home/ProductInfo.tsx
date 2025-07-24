import { Link } from "react-router-dom";

const ProductInfo = () => (
  <div className="overflow-hidden relative bg-blue-50 py-10 px-5">
    <h2 className="text-center text-3xl font-semibold mb-10 text-gray-700">
      Thông tin sản phẩm
    </h2>
    <div className="flex justify-between items-center gap-6 mx-20">
      <div className="w-1/2">
        <h3 className="text-red-600 text-xl mb-2">iPhone 15 – 15 Pro Max</h3>
        <h1 className="text-3xl font-bold mb-5 text-gray-800">
          iPhone 15 Pro Max sẽ có viền màn hình mỏng nhất thế giới.
        </h1>
        <p className="text-gray-600 text-base leading-relaxed mb-5">
          Theo Apple Insider, dữ kiện nhận bằng CAD rõ ràng cho thấy iPhone 15 Pro Max sẽ có viền mỏng hơn iPhone 14 Pro Max, mỏng hơn cả những mẫu điện thoại như Xiaomi 13. iPhone 15 Pro Max sẽ phá kỷ lục độ mỏng viền hiện tại.
        </p>
        <Link to={`/product`} className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
          Xem thêm
        </Link>
      </div>
      <div className="w-1/2 flex justify-center">
        <img
          src="./src/assets/ip15.webp"
          alt="iPhone 15 Pro Max"
          className="max-w-xs rotate-[-30deg] object-cover floating-animation"
        />
      </div>
    </div>
  </div>
);

export default ProductInfo;
