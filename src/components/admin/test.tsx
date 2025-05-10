import React from 'react'

const TestForm = () => {
  return (
    <div>
      <form action="">
        <div>
          <label htmlFor="imageInput">Chọn hình ảnh:</label>
          <input type="text" id="imageInput" name="image" placeholder="Nhập đường dẫn ảnh" />
        </div>

        <div>
          <label htmlFor="priceInput">Giá sản phẩm:</label>
          <input type="text" id="priceInput" name="price" placeholder="VD: 1000 VND" />
        </div>
      </form>
    </div>

  )
}

export default TestForm
