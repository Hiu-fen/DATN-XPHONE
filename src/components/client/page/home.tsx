import BannerClient from "../componentChild/Home/banner"
import HotSaleSection from "../componentChild/Home/hotSale";
import ProductCategory from "../componentChild/Home/CategoryProduct";
import ButtonFilter from "../componentChild/Home/ButtonFilter";
import SmallBanner from "../componentChild/Home/SmallBanner";
import ProductInfo from "../componentChild/Home/ProductInfo";
import NewsletterForm from "../componentChild/Home/NewsletterForm";
import News from "../componentChild/Home/News";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../../api/client/productApiClient";
import { useEffect, useState } from "react";
import AppleWatch from "../componentChild/Home/ApwProduct ";
import IphoneProducts from "../componentChild/Home/iPhoneProduct";
import SamSung from "../componentChild/Home/SamSungProducts";

const Home = () => {
  // Sử dụng useQuery để lấy danh sách sản phẩm
  const { data: allProducts, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
    refetchOnWindowFocus: false,
  });

  // Toggle trạng thái xem thêm
  const [showAll, setShowAll] = useState(false);
  const [showAllApw, setShowAllApw] = useState(false);
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

  // Lọc các sản phẩm theo danh mục: Apple Watch
  const ApwProducts = allProducts?.filter(
    (item) => item.danhmuc === "6842f9fe9e5a3b9c809c39d2"
  ) || [];

  // Lọc các sản phẩm theo danh mục: SamSung
  const SamSungProducts = allProducts?.filter(
    (item) => item.danhmuc === "684117a67543156eb6b1233a"
  ) || [];

  // Xử lý danh sách sản phẩm iPhone để hiển thị (8 hoặc tất cả)
  const displayedIphoneProducts = showAll
    ? iphoneProducts
    : iphoneProducts.slice(0, 8);

  // Xử lý danh sách sản phẩm Apple Watch để hiển thị (8 hoặc tất cả)
  const displayedApwProducts = showAllApw
    ? ApwProducts
    : ApwProducts.slice(0, 8);

  // Xử lý danh sách sản phẩm SamSung để hiển thị (8 hoặc tất cả)
  const displayedSamSungProducts = showAllSamSung
    ? SamSungProducts
    : SamSungProducts.slice(0, 8);

  // Hàm xử lý sự kiện khi nhấn nút "Xem thêm" cho iPhone
  const handleLoadMoreIphone = () => {
    setShowAll((prev) => !prev);
  };

  // Hàm xử lý sự kiện khi nhấn nút "Xem thêm" cho Apple Watch
  const handleLoadMoreApw = () => {
    setShowAllApw((prev) => !prev);
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

        {/* APW */}
        <AppleWatch 
          products={displayedApwProducts || []} 
          isLoading={isLoading} 
          showAll={showAllApw}
          onToggleShowAll={handleLoadMoreApw}
          totalProducts={ApwProducts.length}
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

        {/* Tin tức */}
        <News />

        {/* Các chính sách */}
        <ButtonFilter />

        {/* Form đăng ký nhận tin */}
        <NewsletterForm />
      </div>
    </>
  )
}

export default Home