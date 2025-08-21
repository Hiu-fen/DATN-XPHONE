const Order = require("../models/orderModel");
const Product = require("../models/productModels");
const Cart = require("../models/cartModels");
const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
require("dotenv").config();
const { sendVnpaySuccessEmail } = require("../utils/emailService");

const encodeValue = (value) => {
  if (typeof value === "string") {
    return encodeURIComponent(value).replace(/%20/g, "+");
  }
  return value;
};

const createVnpayUrl = async (req, res) => {
  try {
    const { orderCode, orderId, amount } = req.body;
    if (!orderCode || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin orderCode, orderId hoặc amount",
      });
    }

    const order = await Order.findById(orderId);
    if (!order || order.orderCode !== orderCode) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng hoặc orderCode không khớp",
      });
    }

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "127.0.0.1";
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET?.trim();
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      return res.status(500).json({
        success: false,
        message: "Thiếu cấu hình VNPAY",
      });
    }

    const createDate = moment().format("YYYYMMDDHHmmss");
    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
      vnp_OrderType: "other",
      vnp_Amount: parseInt(amount) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr:
        ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1"
          ? "127.0.0.1"
          : ipAddr,
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

    const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, {
      encode: true,
    })}`;

    return res.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("Lỗi createVnpayUrl:", error);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message || "Không xác định"}`,
    });
  }
};

const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const receivedHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const secretKey = process.env.VNP_HASHSECRET?.trim();
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Thiếu cấu hình VNPAY_HASHSECRET",
      });
    }

    const sortedParams = Object.fromEntries(
      Object.entries(vnp_Params)
        .filter(([_, v]) => v)
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

    if (receivedHash !== calculatedHash) {
      return res.status(400).json({
        success: false,
        message: "Checksum không hợp lệ",
      });
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (responseCode !== "00") {
      return res.status(400).json({
        success: false,
        message: `Thanh toán thất bại: Mã lỗi ${responseCode}`,
      });
    }

    if (!order.isPaid) {
      order.isPaid = true;
      order.paymentStatus = "Đã thanh toán";
      order.status = "Chờ xác nhận";
      order.statusHistory.push({
        status: "Chờ xác nhận",
        timestamp: new Date(),
      });
      await order.save();

      try {
        await sendVnpaySuccessEmail(order.email, order);
        console.log("Đã gửi email xác nhận thanh toán VNPAY");
      } catch (err) {
        console.error("Lỗi gửi email VNPAY:", err.message);
      }
    }

    return res.json({
      success: true,
      message: "Thanh toán thành công",
      orderCode: order.orderCode,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Lỗi vnpayReturn:", error);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message || "Không xác định"}`,
    });
  }
};

const verifyVnpayReturn = async (req, res) => {
  try {
    const vnp_Params = { ...req.query };
    const receivedHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const secretKey = process.env.VNP_HASHSECRET?.trim();
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: "Thiếu cấu hình VNPAY_HASHSECRET",
      });
    }

    const sortedParams = Object.fromEntries(
      Object.entries(vnp_Params)
        .filter(([_, v]) => v)
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

    if (receivedHash !== calculatedHash) {
      return res.status(400).json({
        success: false,
        message: "Checksum không hợp lệ",
      });
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (responseCode !== "00") {
      return res.status(400).json({
        success: false,
        message: `Thanh toán thất bại: Mã lỗi ${responseCode}`,
      });
    }

    if (!order.isPaid) {
      // 🔹 Chỉ trừ tồn kho nếu chưa trừ
      if (!order.isStockDeducted) {
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (!product) continue;

          const color = (item.color || item.snapshot?.color || "").trim();
          const storage = (item.storage || item.snapshot?.storage || "").trim();
          const quantityToDeduct = Number(item.soluong);

          if (
            product.variants &&
            product.variants.length > 0 &&
            color &&
            storage
          ) {
            const variant = product.variants.find(
              (v) => v.color === color && v.ram === storage
            );
            if (variant && variant.soluong >= quantityToDeduct) {
              await Product.updateOne(
                {
                  _id: item.productId,
                  "variants.color": color,
                  "variants.ram": storage,
                },
                { $inc: { "variants.$.soluong": -quantityToDeduct } }
              );
            }
          }

          if (product.soluong >= quantityToDeduct) {
            await Product.updateOne(
              { _id: item.productId },
              { $inc: { soluong: -quantityToDeduct } }
            );
          }
        }

        order.isStockDeducted = true; // đánh dấu đã trừ tồn kho
        await order.save();
      }

      //Cập nhật trạng thái đơn hàng
      order.isPaid = true;
      order.paymentStatus = "Đã thanh toán";
      order.status = "Chờ xác nhận";
      order.statusHistory.push({
        status: "Chờ xác nhận",
        timestamp: new Date(),
      });
      await order.save();

      //Cập nhật giỏ hàng
      if (order.userId) {
        const cart = await Cart.findOne({ userId: order.userId });
        if (cart) {
          cart.items = cart.items.filter((cartItem) => {
            return !order.items.some(
              (orderItem) =>
                orderItem.productId.toString() ===
                  cartItem.productId.toString() &&
                (orderItem.color || orderItem.snapshot?.color || "").trim() ===
                  (cartItem.color || "").trim() &&
                (
                  orderItem.storage ||
                  orderItem.snapshot?.storage ||
                  ""
                ).trim() === (cartItem.storage || "").trim()
            );
          });

          if (cart.items.length === 0) {
            await Cart.findOneAndDelete({ userId: order.userId });
          } else {
            await cart.save();
          }
        }
      }

      //Gửi email xác nhận
      try {
        await sendVnpaySuccessEmail(order.email, order);
      } catch (err) {
        console.error("Lỗi gửi email VNPAY:", err.message);
      }
    }

    return res.json({
      success: true,
      message: "Đã xác minh thanh toán",
      orderCode: order.orderCode,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Lỗi verifyVnpayReturn:", error);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message || "Không xác định"}`,
    });
  }
};

module.exports = {
  createVnpayUrl,
  vnpayReturn,
  verifyVnpayReturn,
};
