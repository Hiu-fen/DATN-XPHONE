const banners = ["banner1.webp", "banner2.webp", "banner3.webp"];
import { Link } from 'react-router-dom';

const SmallBanner = () => (
  <div className="mx-24 grid grid-cols-3 gap-4 pb-8">
    {banners.map((src, i) => (
      <Link
        key={i}
        to={`/product`}
        className="bg-gray-300 rounded-2xl flex items-center justify-center"
      >
        <img
          src={`src/assets/images/${src}`}
          alt={`Banner ${i + 1}`}
          className="w-full h-full object-cover rounded-2xl transition duration-500 ease-in-out hover:scale-105 hover:-translate-y-1 hover:shadow-md will-change-transform"
        />
      </Link>
    ))}
  </div>
);

export default SmallBanner;
