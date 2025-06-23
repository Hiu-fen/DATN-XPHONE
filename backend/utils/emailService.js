// utils/emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "xphonene53@gmail.com",      // Email bạn dùng để gửi
    pass: "dxhg hful yujx avom"       // App password (nếu dùng Gmail)
  }
});

const sendOrderConfirmation = async (to, order) => {
  const itemList = order.items
    .map(
      (item) => `
        <li>
          ${item.productName} - SL: ${item.soluong} - Giá: ${item.price.toLocaleString()}đ
        </li>`
    )
    .join("");

  const mailOptions = {
    from: `"XPhone" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Xác nhận đơn hàng ${order.orderCode}`,
    html: `
      <h2>Xin chào ${order.customerName},</h2>
      <p>Cảm ơn bạn đã đặt hàng tại XPhone!</p>
      <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
      <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
      <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
      <p><strong>Tổng thanh toán:</strong> ${order.total.toLocaleString()}đ</p>
      <h3>Chi tiết sản phẩm:</h3>
      <ul>${itemList}</ul>
      <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmation };
