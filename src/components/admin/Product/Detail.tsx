import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IProduct } from '../../../interface/product';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery<IProduct>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const [mainImage, setMainImage] = useState('');
  const [album, setAlbum] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Lấy tên danh mục dựa theo ID
  const { data: categoryNames } = useQuery<string[]>({
    queryKey: ['category-names', product?.danhmuc],
    queryFn: async () => {
      if (!product?.danhmuc) return ['Không xác định'];

      const categoryIds = Array.isArray(product.danhmuc)
        ? product.danhmuc
        : [product.danhmuc];

      const names = await Promise.all(
        categoryIds.map(async (id) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/category/${id}`);
            return res.data.name;
          } catch (error) {
            return 'Không xác định';
          }
        })
      );

      return names;
    },
    enabled: !!product?.danhmuc,
  });

  useEffect(() => {
    if (!product) return;
    const albumImages = product.albumImages || [];
    let newAlbum = albumImages;
    if (product.image && !albumImages.includes(product.image)) {
      newAlbum = [product.image, ...albumImages];
    }
    setMainImage(newAlbum[0] || '');
    setAlbum(newAlbum);
    setSelectedVariant(null); // reset biến thể khi thay sản phẩm
  }, [product]);

  const handleSelectVariant = (variant: any) => {
    setSelectedVariant(variant);
  };

  if (isLoading) return <p>Đang tải dữ liệu...</p>;
  if (error || !product) return <p>Lỗi hoặc không tìm thấy sản phẩm</p>;

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', padding: 20, fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', gap: 40 }}>
        {/* Hình ảnh sản phẩm */}
        <div style={{ flex: 1 }}>
          <div style={{ border: '1px solid #eee', padding: 10, marginBottom: 20 }}>
            <img
              src={mainImage}
              alt="main"
              style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
            {album.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumb"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  border: img === mainImage ? '2px solid black' : '1px solid #ddd',
                  cursor: 'pointer',
                }}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: 10 }}>{product.name}</h2>

          {/* Giá theo biến thể nếu có */}
          <p style={{ fontWeight: 600, fontSize: 24, marginBottom: 10 }}>
            {(Number(selectedVariant?.price || product.price)).toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </p>

          {/* Biến thể */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <strong>Biến thể:</strong>{' '}
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectVariant(variant)}
                  style={{
                    marginRight: 10,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: selectedVariant === variant ? '2px solid #1890ff' : '1px solid #ccc',
                    backgroundColor: selectedVariant === variant ? '#e6f7ff' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {variant.color} - {variant.ram}
                </button>
              ))}
            </div>
          )}

          <p style={{ marginBottom: 10 }}>
            <strong>Mô tả:</strong> {product.mota || 'Chưa có mô tả'}
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong>Danh mục:</strong> {categoryNames?.join(', ') || 'Không xác định'}
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong>Trạng thái:</strong> {product.trangthai || 'Không rõ'}
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong>Số lượng:</strong>{' '}
            <span
              style={{
                color:
                  (selectedVariant ? selectedVariant.soluong : product.soluong) > 0
                    ? '#389e0d'
                    : '#cf1322',
              }}
            >
              {(selectedVariant
                ? selectedVariant.soluong
                : product.soluong) > 0
                ? (selectedVariant
                    ? selectedVariant.soluong
                    : product.soluong)
                : 'Hết hàng'}
            </span>
          </p>

          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#40a9ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1890ff';
            }}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
