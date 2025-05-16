// AlbumImage.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  images:  string | string[];
  alt: string;
}

const AlbumImage: React.FC<Props> = ({ images, alt }) => {
  let imgArray: string[] = [];

if (Array.isArray(images)) {
  imgArray = images;
} else if (typeof images === 'string') {
  imgArray = images.split(',').map(url => url.trim()).filter(Boolean);
}

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (imgArray.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % imgArray.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [imgArray.length]);

  const currentImage = imgArray[currentIndex];
  const isValid = /\.(png|jpe?g|webp|gif)$/i.test(currentImage);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {isValid ? (
       <img
  src={currentImage}
  alt={alt}
  style={{
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #ddd',
  }}
/>
      ) : (
        <span style={{ color: 'red' }}>Ảnh không hợp lệ</span>
      )}
    </div>
  );
};

export default AlbumImage;
