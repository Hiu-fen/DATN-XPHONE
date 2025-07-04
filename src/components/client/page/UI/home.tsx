import BannerClient from "../../componentChild/Home/banner"
import HotSaleSection from "../../componentChild/Home/hotSale";
import ProductCategory from "../../componentChild/Home/CategoryProduct";
import SmallBanner from "../../componentChild/Home/SmallBanner";
import ProductInfo from "../../componentChild/Home/ProductInfo";
import NewsletterForm from "../../componentChild/Home/NewsletterForm";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../../api/client/productApiClient";
import { useEffect, useState } from "react";
import IphoneProducts from "../../componentChild/Home/iPhoneProduct";
import SamSung from "../../componentChild/Home/SamSungProducts";
import Chatbot from "../../componentChild/Home/ChatBot";
import { FaShippingFast } from "react-icons/fa";
import { MdAutorenew, MdSupportAgent } from "react-icons/md";
import { RiShieldCheckFill } from "react-icons/ri";

const Home = () => {
  // Sử dụng useQuery để lấy danh sách sản phẩm
  const { data: allProducts, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
    refetchOnWindowFocus: false,
  });

  // Toggle trạng thái xem thêm
  const [showAll, setShowAll] = useState(false);
  const [showAllSamSung, setShowAllSamSung] = useState(false);

  // Tự động refetch sau 1 giây nếu đã load xong
  useEffect(() => {
      if (!isLoading) {
        const timeout = setTimeout(() => {
          refetch()
        }, 1000)
        return () => clearTimeout(timeout)
      }
    }, [isLoading, refetch])

  // Lọc các sản phẩm theo danh mục: iPhone
  const iphoneProducts = allProducts?.filter(
    (item) => item.danhmuc === "6841178c7543156eb6b12336"
  ) || [];

  // Lọc các sản phẩm theo danh mục: SamSung
  const SamSungProducts = allProducts?.filter(
    (item) => item.danhmuc === "684117a67543156eb6b1233a"
  ) || [];

  // Xử lý danh sách sản phẩm iPhone để hiển thị (8 hoặc tất cả)
  const displayedIphoneProducts = showAll
    ? iphoneProducts
    : iphoneProducts.slice(0, 8);

  // Xử lý danh sách sản phẩm SamSung để hiển thị (8 hoặc tất cả)
  const displayedSamSungProducts = showAllSamSung
    ? SamSungProducts
    : SamSungProducts.slice(0, 8);

  // Hàm xử lý sự kiện khi nhấn nút "Xem thêm" cho iPhone
  const handleLoadMoreIphone = () => {
    setShowAll((prev) => !prev);
  };

  // Hàm xử lý sự kiện khi nhấn nút "Xem thêm" cho SamSung
  const handleLoadMoreSamSung = () => {
    setShowAllSamSung((prev) => !prev);
  };

  return (
    <>
      <div className="w-full bg-white">
        {/* Banner */}
        <BannerClient />

        {/* Category Product */}
        <ProductCategory />

        {/* Banner phụ */}
        <SmallBanner />

        {/* Hot Sale  */}
        <HotSaleSection />


        {/* iPhone */}
        <IphoneProducts 
          products={displayedIphoneProducts || []} 
          isLoading={isLoading} 
          showAll={showAll}
          onToggleShowAll={handleLoadMoreIphone}
          totalProducts={iphoneProducts.length}
        />

        {/* Thông tin sản phẩm */}
        <ProductInfo />

        {/* Ipad */}
        <SamSung 
          products={displayedSamSungProducts || []} 
          isLoading={isLoading} 
          showAll={showAllSamSung}
          onToggleShowAll={handleLoadMoreSamSung}
          totalProducts={SamSungProducts.length}
        />

        
        
        {/* 4 chính sách hỗ trợ */}
        <div className="w-full mt-10 mb-6 flex flex-wrap justify-center gap-6">
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px]">
            <FaShippingFast className="text-red-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Giao hàng nhanh</h3>
            <p className="text-gray-600 text-center text-sm">Nhận hàng trong 2h tại nội thành, 1-3 ngày toàn quốc.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px]">
            <MdAutorenew className="text-blue-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Đổi trả dễ dàng</h3>
            <p className="text-gray-600 text-center text-sm">Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px]">
            <RiShieldCheckFill className="text-green-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Bảo hành chính hãng</h3>
            <p className="text-gray-600 text-center text-sm">Cam kết sản phẩm chính hãng, bảo hành toàn quốc 12-24 tháng.</p>
          </div>
          <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6 w-64 min-h-[180px]">
            <MdSupportAgent className="text-yellow-500 mb-3" size={48} />
            <h3 className="font-bold text-lg mb-1">Hỗ trợ 24/7</h3>
            <p className="text-gray-600 text-center text-sm">Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.</p>
          </div>
        </div>
        {/* Form đăng ký nhận tin */}
        <NewsletterForm />
        {/* <Chatbot /> */}
        <Chatbot />
      </div>
    </>
  )
}

export default Home