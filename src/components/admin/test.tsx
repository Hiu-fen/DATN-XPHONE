import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Product = {
  id: string
  name: string
  image: string
  price: string
}

interface EditProductProps {
  productId: string
}

const EditProductForm: React.FC<EditProductProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Product>()

  // Giả sử chúng ta lấy thông tin sản phẩm từ API hoặc từ state toàn cục
  useEffect(() => {
    // Fetch sản phẩm theo productId
    // Ví dụ dữ liệu giả
    const fetchProduct = async () => {
      const data = {
        id: productId,
        name: 'Sản phẩm A',
        image: 'https://example.com/image.jpg',
        price: '1000 VND'
      }
      setProduct(data)

      // Set giá trị mặc định cho form
      setValue('name', data.name)
      setValue('image', data.image)
      setValue('price', data.price)
    }
    fetchProduct()
  }, [productId, setValue])

  // Xử lý submit form
  const onSubmit = (data: Product) => {
    console.log('Dữ liệu đã cập nhật:', data)
    // Gửi data lên server hoặc state toàn cục để lưu
  }

  if (!product) {
    return <div>Đang tải dữ liệu...</div>
  }

  return (
    <div>
      <h1>Sửa thông tin sản phẩm</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Tên sản phẩm:</label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Tên sản phẩm không được để trống' })}
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="image">Đường dẫn hình ảnh:</label>
          <input
            id="image"
            type="text"
            {...register('image', { required: 'Đường dẫn hình ảnh không được để trống' })}
          />
          {errors.image && <p>{errors.image.message}</p>}
        </div>

        <div>
          <label htmlFor="price">Giá sản phẩm:</label>
          <input
            id="price"
            type="text"
            {...register('price', { required: 'Giá sản phẩm không được để trống' })}
          />
          {errors.price && <p>{errors.price.message}</p>}
        </div>

        <div>
          <button type="submit">Lưu thay đổi</button>
        </div>
      </form>
    </div>
  )
}

export default EditProductForm
