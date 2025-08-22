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
      console.error("❌ Thiếu cấu hình VNPAY:", {
        tmnCode: !!tmnCode,
        secretKey: !!secretKey,
        vnpUrl: !!vnpUrl,
        returnUrl: !!returnUrl,
      });
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
        ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1" ? "127.0.0.1" : ipAddr,
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
      console.error("❌ Thiếu VNP_HASHSECRET");
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
      console.error("❌ Checksum không hợp lệ", {
        receivedHash,
        calculatedHash,
      });
      return res.status(400).json({
        success: false,
        message: "Checksum không hợp lệ",
      });
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`❌ Không tìm thấy đơn hàng: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const returnUrl = process.env.VNP_RETURN_URL;
    if (!returnUrl) {
      console.error("❌ VNP_RETURN_URL không được cấu hình");
      return res.status(500).json({
        success: false,
        message: "Thiếu cấu hình VNP_RETURN_URL",
      });
    }

    if (responseCode === "00") {
      console.log(`✅ Thanh toán thành công cho đơn hàng ${order.orderCode}`);
      return res.redirect(returnUrl);
    } else {
      console.error(`❌ Thanh toán thất bại cho đơn hàng ${order.orderCode}: Mã lỗi ${responseCode}`);
      return res.status(400).json({
        success: false,
        message: `Thanh toán thất bại: Mã lỗi ${responseCode}`,
      });
    }
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
      console.error("❌ Thiếu VNP_HASHSECRET");
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
      console.error("❌ Checksum không hợp lệ", {
        receivedHash,
        calculatedHash,
      });
      return res.status(400).json({
        success: false,
        message: "Checksum không hợp lệ",
      });
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`❌ Không tìm thấy đơn hàng: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (responseCode !== "00") {
      console.error(`❌ Thanh toán thất bại: Mã lỗi ${responseCode}`);
      return res.status(400).json({
        success: false,
        message: `Thanh toán thất bại: Mã lỗi ${responseCode}`,
      });
    }

    if (!order.isPaid) {
      if (!order.isStockDeducted) {
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.error(`❌ Sản phẩm không tồn tại: ${item.productId}`);
            continue;
          }

          const color = (item.color || item.snapshot?.color || "").trim().toLowerCase();
          const storage = (item.storage || item.snapshot?.storage || "").trim().toLowerCase();
          const quantityToDeduct = Number(item.soluong);

          if (product.variants && product.variants.length > 0 && color && storage) {
            const variant = product.variants.find(
              (v) => v.color.trim().toLowerCase() === color && v.ram.trim().toLowerCase() === storage
            );

            if (!variant) {
              console.error(`❌ Biến thể không tồn tại: ${color}/${storage} cho sản phẩm ${item.productId}`);
              continue;
            }

            if (variant.soluong < quantityToDeduct) {
              console.error(`❌ Không đủ tồn kho cho biến thể: ${color}/${storage} (còn ${variant.soluong})`);
              continue;
            }

            const updateResult = await Product.updateOne(
              { _id: item.productId },
              { 
                $inc: { 
                  "variants.$[elem].soluong": -quantityToDeduct,
                  soluong: -quantityToDeduct // Trừ số lượng tổng của sản phẩm
                }
              },
              {
                arrayFilters: [
                  {
                    "elem.color": { $regex: new RegExp(`^${color}$`, 'i') },
                    "elem.ram": { $regex: new RegExp(`^${storage}$`, 'i') }
                  }
                ]
              }
            );

            if (updateResult.modifiedCount === 0) {
              console.error(`❌ Không thể update biến thể: ${color}/${storage}`);
              continue;
            }

            console.log(`✅ Đã trừ ${quantityToDeduct} từ biến thể: ${color}/${storage} và số lượng tổng`);

            const updatedProduct = await Product.findById(item.productId);
            if (updatedProduct.soluong < 0) {
              updatedProduct.soluong = 0;
              await updatedProduct.save();
              console.warn(`⚠️ Số lượng tổng của sản phẩm ${item.productId} đã được điều chỉnh về 0`);
            }

            if (global._io) {
              console.log(`✅ Emit productUpdated for ${item.productId} with soluong ${updatedProduct.soluong}`);
              global._io.emit('productUpdated', { productId: item.productId, newSoluong: updatedProduct.soluong });
            }
          } else {
            if (product.soluong < quantityToDeduct) {
              console.error(`❌ Không đủ tồn kho cho sản phẩm: ${item.productId} (còn ${product.soluong})`);
              continue;
            }

            product.soluong -= quantityToDeduct;
            await product.save();

            console.log(`✅ Đã trừ ${quantityToDeduct} từ số lượng tổng của sản phẩm ${item.productId}`);

            if (global._io) {
              console.log(`✅ Emit productUpdated for ${item.productId} with soluong ${product.soluong}`);
              global._io.emit('productUpdated', { productId: item.productId, newSoluong: product.soluong });
            }
          }
        }

        order.isStockDeducted = true;
        await order.save();
      }

      // Cập nhật trạng thái chỉ nếu chưa phải "Chờ xác nhận"
      if (order.status !== "Chờ xác nhận") {
        order.status = "Chờ xác nhận";
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status: "Chờ xác nhận", timestamp: new Date() });
      }

      order.isPaid = true;
      order.paymentStatus = "Đã thanh toán";
      await order.save();

      // Cập nhật giỏ hàng
      if (order.userId) {
        const cart = await Cart.findOne({ userId: order.userId });
        if (cart) {
          cart.items = cart.items.filter((cartItem) => {
            return !order.items.some(
              (orderItem) =>
                orderItem.productId.toString() === cartItem.productId.toString() &&
                (orderItem.color || orderItem.snapshot?.color || "").trim().toLowerCase() === (cartItem.color || "").trim().toLowerCase() &&
                (orderItem.storage || orderItem.snapshot?.storage || "").trim().toLowerCase() === (cartItem.storage || "").trim().toLowerCase()
            );
          });

          if (cart.items.length === 0) {
            await Cart.findOneAndDelete({ userId: order.userId });
          } else {
            await cart.save();
          }
        }
      }

      // Gửi email xác nhận
      try {
        await sendVnpaySuccessEmail(order.email, order);
        console.log("✅ Đã gửi email xác nhận thanh toán VNPAY");
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