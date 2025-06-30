const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
require("dotenv").config();

// Hàm encode giá trị theo chuẩn VNPAY
const encodeValue = (value) => {
  if (typeof value === "string") {
    return encodeURIComponent(value).replace(/%20/g, "+"); // Thay %20 thành +
  }
  return value;
};

// ===== TẠO URL THANH TOÁN VNPAY =====
const createVnpayUrl = (req, res) => {
  let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Normalize IP
  if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
    ipAddr = "127.0.0.1";
  }

  const tmnCode = process.env.VNP_TMNCODE;
  const secretKey = process.env.VNP_HASHSECRET.trim(); // Xóa khoảng trắng
  const vnpUrl = process.env.VNP_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  const date = moment();
  const createDate = date.format("YYYYMMDDHHmmss");
  const orderId = date.format("HHmmss");
  const amount = parseInt(req.body.amount) * 100; // Đảm bảo amount là số nguyên

  // Chuẩn hóa orderInfo
  const rawOrderCode = (req.body.orderCode || "").trim();
  const prefix = "Thanh toan don hang";
  const orderInfo = `${prefix} ${rawOrderCode}`;

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  // Sắp xếp & lọc param trước khi ký
  const sortedParams = Object.fromEntries(
    Object.entries(vnp_Params)
      .filter(([_, v]) => v != null && v !== "")
      .sort()
  );

  // Encode các giá trị trước khi tạo signData
  const encodedParams = Object.fromEntries(
    Object.entries(sortedParams).map(([k, v]) => [k, encodeValue(v)])
  );

  const signData = qs.stringify(encodedParams, { encode: false });
  const secureHash = crypto
    .createHmac("sha512", secretKey)
    .update(signData)
    .digest("hex");

  sortedParams.vnp_SecureHash = secureHash;
  // Không thêm vnp_SecureHashType vì phiên bản 2.1.0 không yêu cầu

  const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;

  console.log("==== 🧾 VNPAY - TẠO URL THANH TOÁN ====");
  console.log("▶️ req.body:", req.body);
  console.log("▶️ vnp_Params:", vnp_Params);
  console.log("▶️ sortedParams:", sortedParams);
  console.log("▶️ encodedParams:", encodedParams);
  console.log("▶️ signData:", signData);
  console.log("▶️ secureHash:", secureHash);
  console.log("▶️ paymentUrl:", paymentUrl);

  res.json({ paymentUrl });
};

// ===== CALLBACK SAU KHI THANH TOÁN =====
const vnpayReturn = (req, res) => {
  const vnp_Params = { ...req.query };
  const receivedHash = vnp_Params.vnp_SecureHash;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const secretKey = process.env.VNP_HASHSECRET.trim(); // Xóa khoảng trắng

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

  console.log("==== 🔙 VNPAY - CALLBACK ====");
  console.log("🌐 Query Params:", req.query);
  console.log("🔑 sortedParams:", sortedParams);
  console.log("🔑 encodedParams:", encodedParams);
  console.log("🔑 signData:", signData);
  console.log("🔒 Received Hash:", receivedHash);
  console.log("🔐 Calculated Hash:", calculatedHash);
  console.log("🧪 Checksum Valid:", isValid);

  if (!isValid) {
    console.log("🚫 Checksum failed");
    return res.status(400).send("🚫 Checksum failed");
  }

  if (vnp_Params.vnp_ResponseCode === "00") {
    console.log("🎉 Thanh toán thành công");
    return res.redirect(`/checkout/success?code=${vnp_Params.vnp_TxnRef}`);
  } else {
    console.log("❌ Thanh toán thất bại, code:", vnp_Params.vnp_ResponseCode);
    return res.redirect(`/checkout/failure?code=${vnp_Params.vnp_TxnRef}`);
  }
};

module.exports = {
  createVnpayUrl,
  vnpayReturn,
};