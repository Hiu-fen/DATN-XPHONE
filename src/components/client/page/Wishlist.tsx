import React, { useEffect, useState } from 'react'
import { HeartFilled } from '@ant-design/icons'
import { Card, Image, Tag, Rate, Spin, message } from 'antd'
import axios from 'axios'
import { IProduct } from '../../../interface/product'
import { useNavigate } from 'react-router-dom'

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const userId: string | undefined = user._id

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) {
        message.warning("Bạn chưa đăng nhập!")
        setLoading(false)
        return
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userId}/liked-products`)
        setWishlist(res.data)
      } catch (err) {
        message.error("Không thể lấy danh sách yêu thích.")
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [userId])

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <HeartFilled className="text-red-500" /> Danh sách yêu thích
      </h1>

      <Spin spinning={loading}>
        {wishlist.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            Bạn chưa có sản phẩm yêu thích nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card
                key={item._id}
                hoverable
                className="rounded-xl shadow-md cursor-pointer"
                onClick={() => navigate(`/detail/${item._id}`)}
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
                {/* <Tag color="blue" className="mb-1">{item.danhmuc}</Tag> */}
                <p className="text-sm text-gray-500">Còn lại: {item.soluong} sản phẩm</p>
                <div className="mt-2">
                  <Rate disabled allowHalf value={item.rating || 4} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>
    </div>
  )
}

export default Wishlist
