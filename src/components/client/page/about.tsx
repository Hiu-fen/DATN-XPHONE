import React from 'react'

const About = () => {
  return (
    <div className="max-w-max mx-auto bg-white rounded shadow p-8 mt-8 ">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Giới thiệu về XPhone</h1>
      <p className="mb-4 text-gray-700">
        XPhone là hệ thống bán lẻ các sản phẩm công nghệ chính hãng như iPhone, Macbook, iPad, Apple Watch và phụ kiện cao cấp. 
        Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng, giá cả cạnh tranh cùng dịch vụ chăm sóc tận tâm.
      </p>
      <h2 className="text-xl font-semibold mb-2">Tại sao chọn XPhone?</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>Sản phẩm chính hãng 100%</li>
        <li>Bảo hành uy tín, đổi trả dễ dàng</li>
        <li>Đội ngũ tư vấn chuyên nghiệp, nhiệt tình</li>
        <li>Giao hàng nhanh chóng toàn quốc</li>
        <li>Nhiều chương trình khuyến mãi hấp dẫn</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">Thông tin liên hệ</h2>
      <p className="text-gray-700">
        Địa chỉ: Trịnh Văn Bô <br />
        Hotline: <span className="text-red-600 font-semibold">Hãy alo cho hiếu</span><br />
        Email: <a href="mailto:info@xphone.vn" className="text-blue-600 underline">trinhthiduong@gmail.com</a>
      </p>
    </div>
  )
}

export default About