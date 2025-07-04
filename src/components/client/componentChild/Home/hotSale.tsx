import { FaFire, FaEye, FaHeart, FaArrowRight  } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getTopSellingProducts, TopSellingProduct } from "../../../../api/admin/statisticsApi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { message } from "antd";

function HotSaleSection() {
  const { data: hotProducts, isLoading } = useQuery<TopSellingProduct[]>({
    queryKey: ["hot-sale-products"],
    queryFn: () => getTopSellingProducts("desc"),
    refetchOnWindowFocus: false,
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?._id;
  // Lưu trạng thái yêu thích tạm thời (có thể sync lại sau khi thao tác)
  const [liked, setLiked] = useState<{[key:string]: boolean}>({});

  // Hàm xử lý yêu thích
  const handleLike = async (productId: string) => {
    if (!userId) {
      message.warning("Bạn cần đăng nhập để yêu thích sản phẩm!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/like`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      setLiked((prev) => ({ ...prev, [productId]: data.liked }));
      if (data.liked) message.success("Đã thêm vào yêu thích!");
      else message.info("Đã bỏ khỏi yêu thích!");
    } catch (err) {
      message.error("Có lỗi khi thao tác yêu thích!");
    }
  };

  return (
    <div className="bg-gradient-to-b from-red-600 to-red-500 text-white py-4 px-4 mx-24 rounded-lg">
      <div className="flex items-center justify-start mb-4 space-x-3">
        <h2 className="text-xl font-bold hover:text-yellow-400">TOP BÁN CHẠY NHẤT TUẦN</h2>
        <FaFire size={24} color="orange" />
      </div>
      <div className="w-full">
        <div className="flex flex-row flex-nowrap justify-center items-stretch gap-4 py-2">
          {isLoading && <div>Đang tải...</div>}
          {!isLoading && hotProducts && hotProducts.length === 0 && <div>Không có sản phẩm bán chạy.</div>}
          {!isLoading && hotProducts && hotProducts.map((product) => (
            <div key={product.productId} className="bg-white text-black rounded p-2 w-56 flex flex-col items-center shadow-md h-full flex-shrink-0">
              <div className="bg-gray-200 mb-2 relative rounded overflow-hidden group w-full h-32 flex items-center justify-center" style={{ position: 'relative' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-contain h-full w-full rounded transition duration-500 ease-in-out group-hover:-translate-y-1"
                />
                <div
                  className="absolute top-2 right-2 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <button
                    className="w-8 h-8 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 hover:text-white transition-colors mb-1"
                    title="Xem chi tiết"
                    onClick={() => navigate(`/detail/${product.productId}`)}
                  >
                    <FaEye size={16}/>
                  </button>
                  <button
                    className={`w-8 h-8 bg-white border-gray-400 border rounded-full flex items-center justify-center cursor-pointer transition-colors ${liked[product.productId] ? 'text-red-500' : 'hover:bg-pink-500 hover:text-white'}`}
                    title="Yêu thích"
                    onClick={() => handleLike(product.productId)}
                  >
                    <FaHeart size={16}/>
                  </button>
                </div>
              </div>
              <div className="font-bold text-lg text-center line-clamp-2 min-h-[48px]">{product.name}</div>
              <div className="text-red-500 text-lg font-semibold">Giá: {product.price?.toLocaleString()}đ</div>
              <div className="mt-3 relative w-full">
                <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-red-500 h-6 rounded-full absolute top-0 left-0 z-0"
                    style={{ width: `${Math.min(100, (product.totalSold / 500) * 100)}%` }}
                  ></div>
                  <div className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10">
                    <FaFire className="text-yellow-300" size={14} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold z-20">
                    Đã bán: {product.totalSold}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Slot trống nếu thiếu để luôn đủ 4 cột */}
          {!isLoading && hotProducts && hotProducts.length < 4 && Array.from({ length: 4 - hotProducts.length }).map((_, idx) => (
            <div key={"empty-" + idx} className="bg-transparent p-2 w-56 h-full flex-shrink-0" />
          ))}
        </div>
      </div>
      <div className="text-center mt-6">  
       
      </div>
    </div>
  )
}

export default HotSaleSection
