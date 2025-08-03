import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, Button, Space, Typography, Divider, Spin, Alert, Table } from 'antd';

const { Title } = Typography;

interface Variant {
  color: string;
  ram: string;
  price: number;
  soluong: number;
  sold?: number;
}

interface IProduct {
  _id: string;
  name: string;
  price: number;
  soluong: number;
  mota?: string;
  danhmuc?: string | string[];
  trangthai?: string;
  image?: string;
  albumImages?: string[];
  variants?: Variant[];
  totalSold?: number;
}

interface OrderItem {
  productId: string;
  productName: string;
  soluong: number;
  price: number;
  snapshot?: {
    name: string;
    price: number;
    image?: string;
    color?: string;
    ram?: string;
  };
}

interface IOrder {
  _id: string;
  orderCode: string;
  status: string;
  items: OrderItem[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mainImage, setMainImage] = useState('');
  const [album, setAlbum] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Lấy thông tin sản phẩm
  const { data: product, isLoading, error } = useQuery<IProduct>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Lấy danh sách đơn hàng
  const { data: orders, isLoading: isLoadingOrders } = useQuery<IOrder[]>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/orders?productId=${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchInterval: 60000, // Tự động làm mới mỗi 60 giây
  });

  // Lấy tên danh mục
  const { data: categoryNames } = useQuery<string[]>({
    queryKey: ['category-names', product?.danhmuc],
    queryFn: async () => {
      const ids = Array.isArray(product?.danhmuc) ? product?.danhmuc : [product?.danhmuc];
      const names = await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await axios.get(`http://localhost:5000/api/category/${id}`);
            return res.data.name;
          } catch {
            return 'Không xác định';
          }
        })
      );
      return names;
    },
    enabled: !!product?.danhmuc,
  });

  // Cập nhật album ảnh khi có sản phẩm
  useEffect(() => {
    if (!product) return;

    const images = product.albumImages || [];
    const updatedAlbum = product.image && !images.includes(product.image)
      ? [product.image, ...images]
      : images;

    setAlbum(updatedAlbum);
    setMainImage(updatedAlbum[0] || '');
    setSelectedVariant(null);
  }, [product]);

  // Chọn biến thể
  const handleSelectVariant = (variant: Variant, index: number) => {
    setSelectedVariant(variant);

    const totalVariants = product?.variants?.length || 0;
    const subImages = album.slice(1);
    const variantsPerImage = Math.ceil(totalVariants / subImages.length);
    const imageIndex = Math.floor(index / variantsPerImage);
    const newMainImage = subImages[imageIndex] || album[0];
    setMainImage(newMainImage);
  };

  // Tính toán giá
  const price = useMemo(() => {
    return Number(selectedVariant?.price || product?.price || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  }, [selectedVariant, product]);

  // Tính toán thống kê bán hàng từ đơn hàng
  const salesStats = useMemo(() => {
    if (!orders || !product) return { totalSold: 0, variants: [] };

    // Chỉ tính đơn hàng có trạng thái "Đã nhận hàng" hoặc "Giao thành công"
    const completedOrders = orders.filter(
      (order) => order.status === 'Đã nhận hàng' || order.status === 'Giao thành công'
    );

    let totalSold = 0;
    const variantSales: { [key: string]: { color: string; ram: string; quantity: number } } = {};

    completedOrders.forEach((order) => {
      order.items
        .filter((item) => item.productId === id)
        .forEach((item) => {
          totalSold += item.soluong;
          const color = item.snapshot?.color || 'Mặc định';
          // Tìm ram từ product.variants dựa trên snapshot.color
          let ram = item.snapshot?.ram || 'Mặc định';
          if (color !== 'Mặc định' && product.variants) {
            const matchingVariant = product.variants.find((v) => v.color === color);
            if (matchingVariant) {
              ram = matchingVariant.ram;
            }
          }
          const variantKey = `${color}-${ram}`;
          if (!variantSales[variantKey]) {
            variantSales[variantKey] = {
              color,
              ram,
              quantity: 0,
            };
          }
          variantSales[variantKey].quantity += item.soluong;
        });
    });

    // Debug log để kiểm tra dữ liệu
    console.log('Orders:', orders);
    console.log('VariantSales:', variantSales);
    console.log('Product Variants:', product?.variants);

    // Chuyển variantSales thành mảng để hiển thị trong bảng
    const variants = Object.values(variantSales).sort((a, b) => b.quantity - a.quantity);

    return { totalSold, variants };
  }, [orders, product, id]);

  // Cột cho bảng thống kê
  const salesColumns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: () => product?.name || 'Không xác định',
    },
    {
      title: 'Biến thể',
      key: 'variant',
      width: 200,
      render: (_: any, record: any) => `${record.color} - ${record.ram}`,
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center' as const,
      render: (quantity: number) => quantity.toLocaleString(),
    },
  ];

  if (isLoading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error || !product) return <Alert message="Lỗi hoặc không tìm thấy sản phẩm" type="error" showIcon />;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: 'auto' }}>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </Button>
      <Button
        style={{ marginBottom: 16, marginLeft: 8 }}
        onClick={() => {
          if (id) {
            queryClient.invalidateQueries({
              queryKey: ['orders', id],
            });

          }
        }}


      >
        Làm mới thống kê
      </Button>

      <Title level={3}>{product.name}</Title>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Hình ảnh */}
        <div style={{ flex: 1 }}>
          <Card style={{ marginBottom: 16 }}>
            <img src={mainImage} alt="main" style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }} />
          </Card>
          <Space wrap>
            {album.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumb"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: img === mainImage ? '2px solid #1890ff' : '1px solid #ddd',
                }}
                onClick={() => setMainImage(img)}
              />
            ))}
          </Space>
        </div>

        {/* Thông tin sản phẩm */}
        <div style={{ flex: 1 }}>
          <Card>
            <p style={{ fontSize: 24, fontWeight: 600, marginBottom: 10 }}>{price}</p>

            {/* Biến thể */}
            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Biến thể:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {product.variants.map((variant, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSelectVariant(variant, index)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: selectedVariant === variant ? '2px solid #1890ff' : '1px solid #ccc',
                        backgroundColor: selectedVariant === variant ? '#e6f7ff' : '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1.5,
                        height: 'auto',
                      }}
                    >
                      {variant.color} - {variant.ram}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Thống kê bán hàng */}
            <div style={{ marginBottom: 16 }}>
              {isLoadingOrders ? (
                <Spin tip="Đang tải dữ liệu thống kê..." />
              ) : (
                <>
                  <p>
                    <strong>Tổng số lượng bán:</strong> {salesStats.totalSold.toLocaleString()} sản phẩm
                  </p>
                  <Table
                    dataSource={salesStats.variants}
                    columns={salesColumns}
                    pagination={false}
                    rowKey={(record) => `${record.color}-${record.ram}`}
                    locale={{ emptyText: 'Không có dữ liệu bán hàng' }}
                  />
                </>
              )}
            </div>

            <p><strong>Mô tả:</strong> {product.mota || 'Chưa có mô tả'}</p>
            <p><strong>Danh mục:</strong> {categoryNames?.join(', ') || 'Không xác định'}</p>
            <p><strong>Trạng thái:</strong> {product.trangthai || 'Không rõ'}</p>
            <p>
              <strong>Số lượng tồn:</strong>{' '}
              <span
                style={{
                  color: (selectedVariant?.soluong || product.soluong) > 0 ? '#389e0d' : '#cf1322',
                }}
              >
                {(selectedVariant?.soluong || product.soluong) > 0
                  ? selectedVariant?.soluong || product.soluong
                  : 'Hết hàng'}
              </span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;