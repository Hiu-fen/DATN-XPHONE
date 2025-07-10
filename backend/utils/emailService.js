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

// ...existing code...
const sendOrderConfirmation = async (to, order) => {
  const itemRows = order.items
    .map((item) => {
      const color = item.color || item.snapshot?.color || "Không rõ";
      const storage = item.storage || item.snapshot?.storage || "Không rõ";
      const imageUrl = item.image || item.snapshot?.image || "https://via.placeholder.com/80"; // ảnh mặc định

      return `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <img src="${imageUrl}" alt="${item.productName}" style="width: 80px; height: auto;" />
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;">${item.productName}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${color}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${storage}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.soluong}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${item.price.toLocaleString()}đ</td>
        </tr>`;
    })
    .join("");

  const customerName = order.customerName || "Khách hàng";
  const phone = order.phone || "Không có";
  const address = order.address || "Không có";
  // Thêm thời gian đặt hàng
  const orderDate = order.date
    ? new Date(order.date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false })
    : new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });

  const mailOptions = {
    from: `"XPhone" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Xác nhận đơn hàng ${order.orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xin chào ${customerName},</h2>
        <p style="font-size: 15px;">Cảm ơn bạn đã đặt hàng tại <strong>XPhone</strong>!</p>
        
        <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
        <p><strong>Thời gian đặt hàng:</strong> ${orderDate}</p>
        <p><strong>Người nhận:</strong> ${customerName}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Địa chỉ giao hàng:</strong> ${address}</p>
        <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
        <p><strong>Tổng thanh toán:</strong> ${order.total.toLocaleString()}đ</p>

        <h3>Chi tiết sản phẩm:</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="border: 1px solid #ccc; padding: 8px;">Ảnh</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Tên SP</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Màu</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Bộ nhớ</th>
              <th style="border: 1px solid #ccc; padding: 8px;">SL</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <p style="font-size: 15px">Chúng tôi sẽ sớm liên hệ để xác nhận và xử lý đơn hàng.</p>
         <p style="font-size: 15px">Trân trọng,<br><strong>Đội ngũ XPhone</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
// ...existing



const sendDeliverySuccessEmail = async (to, order) => {
  const deliveryDate = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  const itemRows = order.items
    .map((item) => {
      const color = item.color || item.snapshot?.color || "Không rõ";
      const storage = item.storage || item.snapshot?.storage || "Không rõ";
      const imageUrl = item.image || item.snapshot?.image || "https://via.placeholder.com/80";

      return `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <img src="${imageUrl}" alt="${item.productName}" style="width: 80px; height: auto;" />
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;">${item.productName}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${color}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${storage}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.soluong}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${item.price.toLocaleString()}đ</td>
        </tr>`;
    })
    .join("");

  const customerName = order.customerName || "Khách hàng";
  const phone = order.phone || "Không có";
  const address = order.address || "Không có";

  const mailOptions = {
    from: `"XPhone" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Giao hàng thành công - Đơn hàng ${order.orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xin chào ${customerName},</h2>
        <p style="font-size: 15px">Chúng tôi xin thông báo đơn hàng <strong>${order.orderCode}</strong> đã được <strong>giao thành công</strong></p>
        <p><strong>Thời gian giao hàng:</strong> ${deliveryDate}</p>
        <p><strong>Người nhận:</strong> ${customerName}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Địa chỉ giao hàng:</strong> ${address}</p>
        <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
        <p><strong>Tổng thanh toán:</strong> ${order.total.toLocaleString()}đ</p>

        <h3>Chi tiết sản phẩm:</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="border: 1px solid #ccc; padding: 8px;">Ảnh</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Tên SP</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Màu</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Bộ nhớ</th>
              <th style="border: 1px solid #ccc; padding: 8px;">SL</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

       <p style="font-size: 15px">
  Một lần nữa, <strong>XPhone</strong> xin chân thành cảm ơn bạn đã tin tưởng và lựa chọn chúng tôi trong suốt quá trình mua sắm. Sự hài lòng của bạn chính là động lực để chúng tôi không ngừng cải thiện và mang đến dịch vụ tốt hơn mỗi ngày.
</p>

<p style="font-size: 15px">
  Rất mong được tiếp tục phục vụ bạn trong những lần mua sắm tiếp theo. Nếu bạn có bất kỳ câu hỏi hay yêu cầu nào, đừng ngần ngại liên hệ với chúng tôi qua email này .Chúng tôi luôn sẵn sàng hỗ trợ bạn.
</p>
<p style="font-size: 15px">
Và cuối cùng , nếu bạn hài lòng với sản phẩm và dịch vụ của chúng tôi, hãy dành chút thời gian để đánh giá và chia sẻ trải nghiệm của bạn vào link sau đây: <strong style="color: blue;">https://docs.google.com/forms/u/3/d/1C44YIPFbI0eKOlTVbtfVAnvZiYY1a8uK3pXR489GPck/edit</strong>.
</p>

        <p style="font-size: 15px">Trân trọng,<br><strong>Đội ngũ XPhone</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
const sendVnpaySuccessEmail = async (to, order) => {
  const orderDate = order.date
    ? new Date(order.date).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false })
    : new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });

  const itemRows = order.items
    .map((item) => {
      const color = item.color || item.snapshot?.color || "Không rõ";
      const storage = item.storage || item.snapshot?.storage || "Không rõ";
      const imageUrl = item.image || item.snapshot?.image || "https://via.placeholder.com/80";
      return `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">
            <img src="${imageUrl}" alt="${item.productName}" style="width: 80px; height: auto;" />
          </td>
          <td style="border: 1px solid #ccc; padding: 8px;">${item.productName}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${color}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${storage}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.soluong}</td>
          <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${item.price.toLocaleString()}đ</td>
        </tr>`;
    })
    .join("");

  const customerName = order.customerName || "Khách hàng";
  const phone = order.phone || "Không có";
  const address = order.address || "Không có";
  const paymentMethod = order.paymentMethod || "VNPAY";
  const total = order.total ? order.total.toLocaleString() + "đ" : "Không có";

  const mailOptions = {
    from: `"XPhone" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Thanh toán thành công VNPAY - Đơn ${order.orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xin chào ${customerName},</h2>
        <p style="font-size: 15px;">Cảm ơn bạn đã thanh toán thành công qua <strong>VNPAY</strong>!</p>
        <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
        <p><strong>Thời gian thanh toán:</strong> ${orderDate}</p>
        <p><strong>Người nhận:</strong> ${customerName}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Địa chỉ giao hàng:</strong> ${address}</p>
        <p><strong>Phương thức thanh toán:</strong> ${paymentMethod}</p>
        <p><strong>Tổng thanh toán:</strong> ${total}</p>

        <h3>Chi tiết sản phẩm:</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="border: 1px solid #ccc; padding: 8px;">Ảnh</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Tên SP</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Màu</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Bộ nhớ</th>
              <th style="border: 1px solid #ccc; padding: 8px;">SL</th>
              <th style="border: 1px solid #ccc; padding: 8px;">Giá</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        <p style="font-size: 15px;">Đơn hàng của bạn đang được xử lý và chuẩn bị giao.</p>
       
        <p style="font-size: 15px">Trân trọng,<br><strong>Đội ngũ XPhone</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};



module.exports = {
  sendOrderConfirmation,
  sendDeliverySuccessEmail, // 👈 Export thêm
  sendVnpaySuccessEmail,
};



