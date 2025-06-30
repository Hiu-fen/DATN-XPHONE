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
      <div className="w-full">
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

        {/* Form đăng ký nhận tin */}
        <NewsletterForm />
        
        {/* <Chatbot /> */}
      </div>
    </>
  )
}

export default Home