const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
require("dotenv").config();

const Order = require("../models/orderModel");
const Product = require("../models/productModels");

// Hàm encode theo chuẩn VNPAY
const encodeValue = (value) => {
  if (typeof value === "string") {
    return encodeURIComponent(value).replace(/%20/g, "+");
  }
  return value;
};

// ===== TẠO URL THANH TOÁN VNPAY =====
const createVnpayUrl = (req, res) => {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
    ipAddr = "127.0.0.1";
  }

  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET.trim();
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = moment();
  const createDate = date.format("YYYYMMDDHHmmss");
  const orderCode = (req.body.orderCode || "").trim();

  const amount = parseInt(req.body.amount) * 100;
  const orderInfo = `Thanh toan don hang ${orderCode}`;

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderCode,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .filter(([_, v]) => v != null && v !== "")
      .sort()
  );

  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
  );

  const signData = qs.stringify(encodedParams, { encode: false });
  const secureHash = crypto.createHmac("sha512", secretKey).update(signData).digest("hex");

  sortedParams.vnp_SecureHash = secureHash;

  const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;

  res.json({ paymentUrl });
};

// ===== API CALLBACK XÁC NHẬN TỪ VNPAY (KHÔNG dùng cho React) =====
const vnpayReturn = async (req, res) => {
  const vnp_Params = { ...req.query };
  const receivedHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const secretKey = process.env.VNP_HASHSECRET.trim();

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params).filter(([_, v]) => v).sort()
  );

  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
  );

  const signData = qs.stringify(encodedParams, { encode: false });
  const calculatedHash = crypto.createHmac("sha512", secretKey).update(signData).digest("hex");

  const isValid = receivedHash === calculatedHash;

  if (!isValid) {
    return res.status(400).json({ success: false, message: "❌ Checksum không hợp lệ" });
  }

  if (vnp_Params.vnp_ResponseCode === "00") {
    const orderCode = vnp_Params.vnp_TxnRef;
    const order = await Order.findOne({ orderCode });
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    if (!order.isPaid) {
      // Đảm bảo trừ đúng biến thể
      for (const item of order.items) {
        const color = item.color || item.snapshot?.color;
        const storage = item.storage || item.snapshot?.storage;

        if (!color || !storage) continue;

        // Tìm biến thể đúng
        const result = await Product.updateOne(
          {
            _id: item.productId,
            "variants.color": color,
            "variants.ram": storage,  // Sử dụng đúng giá trị color và storage để tìm biến thể
          },
          {
            $inc: { "variants.$.soluong": -Number(item.soluong) },  // Trừ số lượng biến thể
          }
        );

        if (result.modifiedCount === 0) {
          console.warn(`⚠️ Không trừ được số lượng cho biến thể: ${item.productName} | Màu: ${color} - Bộ nhớ: ${storage}`);
        } else {
          console.log(`✅ Đã trừ số lượng cho biến thể: ${item.productName} | Màu: ${color} - Bộ nhớ: ${storage}`);
        }

        // Trừ số lượng tổng của sản phẩm chính
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { soluong: -Number(item.soluong) } }  // Trừ số lượng tổng của sản phẩm chính
        );
      }
    }

    order.isPaid = true;
    order.paymentStatus = "Đã thanh toán";
    order.status = "Chờ xác nhận"; // Hoặc trạng thái bạn muốn
    await order.save();

    return res.json({ success: true, orderCode });
  }

  return res.json({ success: false, message: "Thanh toán thất bại." });
};



// ===== API JSON DÙNG CHO FE (React) GỌI LẠI SAU KHI THANH TOÁN =====
const verifyVnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const receivedHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const secretKey = process.env.VNP_HASHSECRET?.trim();
    if (!secretKey) return res.status(500).json({ message: "Thiếu secret key" });

    // Kiểm tra và xác thực checksum
    const sortedParams = Object.fromEntries(
      Object.entries(vnp_Params).filter(([_, v]) => v).sort()
    );

    const encodedParams = Object.fromEntries(
      Object.entries(sortedParams).map(([k, v]) => [k, encodeURIComponent(v).replace(/%20/g, "+")])
    );

    const signData = qs.stringify(encodedParams, { encode: false });
    const calculatedHash = crypto.createHmac("sha512", secretKey).update(signData).digest("hex");

    if (calculatedHash !== receivedHash) {
      return res.status(400).json({ success: false, message: "Checksum không hợp lệ" });
    }

    // Kiểm tra mã phản hồi từ VNPAY
    if (vnp_Params.vnp_ResponseCode === "00") {
      const orderCode = vnp_Params.vnp_TxnRef;
      const order = await Order.findOne({ orderCode });
      if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

      if (!order.isPaid) {
        // Trừ số lượng biến thể và số lượng tổng
        for (const item of order.items) {
          const color = item.color || item.snapshot?.color;
          const storage = item.storage || item.snapshot?.storage;

          if (!color || !storage) continue;

          const result = await Product.updateOne(
            {
              _id: item.productId,
              "variants.color": color,
              "variants.ram": storage,
            },
            {
              $inc: { "variants.$.soluong": -Number(item.soluong) },  // Trừ số lượng biến thể
            }
          );

          console.log(
            result.modifiedCount > 0
              ? `✅ Trừ tồn kho: ${item.productName} | ${color} - ${storage} - SL: ${item.soluong}`
              : `⚠️ Không trừ được sản phẩm ${item.productName}`
          );

          // Trừ số lượng tổng của sản phẩm chính
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { soluong: -Number(item.soluong) } }  // Trừ số lượng tổng của sản phẩm chính
          );
        }
      }

      // Cập nhật trạng thái thanh toán
      order.isPaid = true;
      order.paymentStatus = "Đã thanh toán";
      order.status = "Chờ xác nhận";  // Hoặc trạng thái mà bạn muốn
      await order.save();

      return res.json({ success: true, orderCode });
    }

    return res.json({ success: false, message: "Thanh toán thất bại" });
  } catch (err) {
    console.error("Lỗi verifyVnpayReturn:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};



module.exports = {
  createVnpayUrl,
  vnpayReturn,
  verifyVnpayReturn,
};
