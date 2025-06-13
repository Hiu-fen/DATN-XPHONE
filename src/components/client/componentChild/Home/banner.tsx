import { useQuery } from '@tanstack/react-query';
import { IBanner } from '../../../../interface/banner';
import { Skeleton, Carousel } from 'antd';
import { Link } from 'react-router-dom';
import type { CarouselProps } from 'antd';
import { getActiveBanners } from '../../../../api/client/bannerApiClient';

const BannerClient = () => {
  // Lấy danh sách banner từ API
  const { data: banners, isLoading } = useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const response = await getActiveBanners();
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Nếu đang loading hoặc không có banner
  if (isLoading || !banners || banners.length === 0) {
    return (
      <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        <Skeleton.Image
          active
          style={{ width: '100vw', height: 600, objectFit: 'cover' }}
        />
      </div>
    );
  }

  // Cấu hình Carousel
  const settings: CarouselProps = {
    autoplay: true,
    autoplaySpeed: 8000,
    dots: true,
    effect: 'scrollx', 
    arrows: true,
  };

  return (
    <div className="relative left-1/2 -translate-x-1/2 overflow-hidden px-4">
      <Carousel {...settings}>
        {banners.map((banner: IBanner) => (
          <div key={banner._id} className="w-full h-[550px]">
            <Link to={banner.link} rel="noopener noreferrer">
              <img
                src={banner.imageUrl}
                alt={banner.name}
                className="w-full h-auto object-cover"
              />
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerClient;
