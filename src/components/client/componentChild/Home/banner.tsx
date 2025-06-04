import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IBanner } from '../../../../interface/banner';



const BannerClient = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);


  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/banners');
      return response.data.filter((banner: IBanner) => banner.status === true);
    }
  });

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (isLoading || !banners || banners.length === 0) {
    return (
      <div className="mx-4 overflow-hidden relative h-[400px] bg-gray-100 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400">Loading banner...</span>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="mx-4 overflow-hidden relative">
      <a href={currentBanner.link} target="_blank" rel="noopener noreferrer">
        <img
          src={currentBanner.image}
          alt={currentBanner.name}
          className="w-full h-[400px] object-cover transition-opacity duration-500"
        />
      </a>
      
     
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_: IBanner, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentBannerIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerClient;