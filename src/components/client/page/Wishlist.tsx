import React, { useState } from 'react'
import { HeartFilled } from '@ant-design/icons'
import { Card, Image, Tag, Rate } from 'antd'

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      image: 'https://via.placeholder.com/150',
      name: 'Áo thun nam cotton',
      price: 199000,
      category: 'Thời trang nam',
      quantity: 20,
      sold: 150,
      rating: 4.5,
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/150',
      name: 'Giày thể thao nữ',
      price: 499000,
      category: 'Thời trang nữ',
      quantity: 12,
      sold: 230,
      rating: 4,
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/150',
      name: 'Tai nghe Bluetooth',
      price: 299000,
      category: 'Phụ kiện công nghệ',
      quantity: 8,
      sold: 90,
      rating: 3.5,
    },
  ])

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <HeartFilled className="text-red-500" /> Danh sách yêu thích
      </h1>

      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          Bạn chưa có sản phẩm yêu thích nào.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card
              key={item.id}
              hoverable
              className="rounded-xl shadow-md"
              cover={
                <Image
                  alt={item.name}
                  src={item.image}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: '0.5rem 0.5rem 0 0' }}
                  preview={false}
                />
              }
            >
              <h2 className="text-lg font-semibold mb-1">{item.name}</h2>
              <p className="text-red-600 font-medium mb-2">
                Giá: {item.price.toLocaleString('vi-VN')}₫
              </p>
              <Tag color="blue" className="mb-1">{item.category}</Tag>
              <p className="text-sm text-gray-500">Còn lại: {item.quantity} sản phẩm</p>
              <p className="text-sm text-gray-500">Đã bán: {item.sold}</p>
              <div className="mt-2">
                <Rate disabled allowHalf value={item.rating} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
