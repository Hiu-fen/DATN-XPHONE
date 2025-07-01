const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
require("dotenv").config();

const Order = require("../models/orderModel"); // Đảm bảo đã có model Order

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

  const rawOrderCode = (req.body.orderCode || "").trim();
  const prefix = "Thanh toan don hang";
  const orderInfo = `${prefix} ${rawOrderCode}`;

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
  const secureHash = crypto
    .createHmac("sha512", secretKey)
    .update(signData)
    .digest("hex");

  sortedParams.vnp_SecureHash = secureHash;

  const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;

  res.json({ paymentUrl });
};

// ===== CALLBACK XÁC NHẬN SAU KHI THANH TOÁN VNPAY =====
const vnpayReturn = async (req, res) => {
  const vnp_Params = { ...req.query };
  const receivedHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const secretKey = process.env.VNP_HASHSECRET.trim();

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .filter(([_, v]) => v != null && v !== "")
      .sort()
  );

  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
  );

  const signData = qs.stringify(encodedParams, { encode: false });
  const calculatedHash = crypto
    .createHmac("sha512", secretKey)
    .update(signData)
    .digest("hex");

  const isValid = receivedHash === calculatedHash;

  if (!isValid) {
    return res.status(400).json({ success: false, message: "❌ Checksum không hợp lệ" });
  }

  if (vnp_Params.vnp_ResponseCode === "00") {
  try {
    const orderCode = vnp_Params.vnp_TxnRef;

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    order.isPaid = true;
    order.status = "Đã thanh toán";
    await order.save();

    return res.json({ success: true, orderCode });
  } catch (error) {
    console.error("Lỗi cập nhật đơn hàng:", error);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
}
 else {
    return res.json({ success: false, message: "Thanh toán thất bại." });
  }

};
// ✅ Đây là API JSON dùng cho React gọi
const verifyVnpayReturn = async (req, res) => {
  const vnp_Params = { ...req.query };
  const receivedHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const secretKey = process.env.VNP_HASHSECRET.trim();

  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params).filter(([_, v]) => v).sort()
  );

  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeURIComponent(v).replace(/%20/g, "+")])
  );

  const signData = require("qs").stringify(encodedParams, { encode: false });
  const calculatedHash = require("crypto")
    .createHmac("sha512", secretKey)
    .update(signData)
    .digest("hex");

  if (calculatedHash !== receivedHash) {
    return res.status(400).json({ success: false, message: "Checksum không hợp lệ" });
  }

 if (vnp_Params.vnp_ResponseCode === "00") {
  const orderCode = vnp_Params.vnp_TxnRef;
  try {
    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    order.isPaid = true;
    order.status = "Đã thanh toán";
    await order.save();

    return res.json({ success: true, orderCode });
  } catch (err) {
    console.error("Lỗi xử lý:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}


  return res.json({ success: false, message: "Thanh toán thất bại" });
};



module.exports = {
  createVnpayUrl,
  vnpayReturn,
  verifyVnpayReturn,
};
