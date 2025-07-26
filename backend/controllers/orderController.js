
const Order = require("../models/orderModel");
const Product = require("../models/productModels");
const Notification = require("../models/notificationModels");
const Promotion = require("../models/promotionModels");
const Cart = require("../models/cartModels");
const axios = require("axios");

const { sendOrderConfirmation } = require("../utils/emailService");
const { sendDeliverySuccessEmail } = require("../utils/emailService");
const { sendVnpaySuccessEmail } = require("../utils/emailService");

// Danh sách đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentMethod: { $ne: "VNPAY" } }, { isPaid: true }],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      $or: [{ paymentMethod: { $ne: "VNPAY" } }, { isPaid: true }],
    });

    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const currentStatus = order.status;

    if (status === "Đã nhận hàng" && currentStatus !== "Giao thành công") {
      return res.status(400).json({
        message:
          "Không được phép cập nhật trạng thái 'Đã nhận hàng' theo cách này.",
      });
    }

    if (
      (status === "Đã huỷ" || status === "Trả hàng/Hoàn tiền") &&
      !["Đã huỷ", "Trả hàng/Hoàn tiền"].includes(currentStatus)
    ) {
      const restoreItems = order.items.map((item) => ({
        productId: item.productId,
        color: item.color || item.snapshot?.color || "",
        ram: item.storage || item.snapshot?.storage || "",
        quantity: item.soluong,
      }));

      try {
        const response = await axios.post(
          "http://localhost:5000/api/products/restore-quantity",
          {
            items: restoreItems,
          }
        );
        console.log("✅ Khôi phục số lượng thành công:", response.data.message);
      } catch (err) {
        console.error(
          "❌ Lỗi khi gọi restore-quantity:",
          err?.response?.data || err.message
        );
        return res
          .status(500)
          .json({ message: "Lỗi khi khôi phục số lượng biến thể" });
      }
    }

    order.status = status;
    if (cancelReason) {
      order.cancelReason = cancelReason;
    }

    order.statusHistory = [
      ...(order.statusHistory || []),
      { status, timestamp: new Date() },
    ];
    await order.save();
    global._io.emit("orderUpdated", order);

    if (status === "Giao thành công") {
      try {
        await sendDeliverySuccessEmail(order.email, order);
        console.log("✅ Đã gửi email giao hàng thành công.");
      } catch (err) {
        console.error("❌ Lỗi gửi email giao thành công:", err.message);
      }
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng" });
  }
};

// Yêu cầu trả hàng
exports.updateOrderReturn = async (req, res) => {
  try {
    const { returnStatus, returnReason, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.returnStatus = returnStatus;
    if (returnReason) order.returnReason = returnReason;
    if (note) order.returnNote = note;

    if (req.files && req.files.length > 0) {
      order.returnImages = req.files.map((file) => file.path);
    }

    if (returnStatus === "Đã duyệt") {
      await axios.post("http://localhost:5000/api/products/restore-quantity", {
        items: order.items.map((item) => ({
          productId: item.productId,
          color: item.color || item.snapshot?.color || "",
          ram: item.storage || item.snapshot?.storage || "",
          quantity: item.soluong,
        })),
      });

      order.status = "Trả hàng/Hoàn tiền";
      order.statusHistory = [
        ...(order.statusHistory || []),
        { status: "Trả hàng/Hoàn tiền", timestamp: new Date() },
      ];

      if (order.isPaid) order.refunded = true;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error("❌ Lỗi updateOrderReturn:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xử lý trả hàng", error: error.message });
  }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      email,
      items,
      total,
      paymentMethod,
      shippingProvider,
      notes,
      isPaid = false,
      userId = null,
      shippingFee: calculatedShippingFee,
      voucherCode,
      discountAmount = 0,
      isBuyNow = false,
    } = req.body;

    if (!customerName || !phone || !address || !items || !total || !email) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const generateOrderCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `ORD-${code}`;
    };

    let orderCode = req.body.orderCode;

    if (!orderCode) {
      orderCode = generateOrderCode();
      while (await Order.findOne({ orderCode })) {
        orderCode = generateOrderCode();
      }
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res
          .status(404)
          .json({ message: `Sản phẩm ${item.productName} không tồn tại` });
      if (product.soluong < item.soluong) {
        return res
          .status(400)
          .json({ message: `Không đủ hàng cho sản phẩm ${item.productName}` });
      }

      item.snapshot = {
        name: item.productName,
        price: item.price,
        image: product.image,
        color: item.color || "",
        storage: item.storage || "",
      };
    }

    const order = new Order({
      orderCode,
      customerName,
      phone,
      address,
      email,
      items,
      total,
      paymentMethod,
      shippingProvider,
      notes,
      isPaid,
      userId,
      voucherCode,
      shippingFee: calculatedShippingFee || 0,
      discountAmount,
      status: "Chờ xác nhận",
      statusHistory: [{ status: "Chờ xác nhận", timestamp: new Date() }],
      isBuyNow,
    });

    await order.save();

    let updatedCart = null;
    if (userId) {
      try {
        const cart = await Cart.findOne({ userId });
        if (cart) {
          const orderItemIds = items.map((item) => ({
            productId: item.productId,
            color: item.color || "",
            storage: item.storage || "",
            quantity: item.soluong,
          }));

          if (isBuyNow) {
            // Luồng "Mua ngay": Giảm số lượng sản phẩm trùng trong giỏ hàng
            cart.items = cart.items.map((cartItem) => {
              const matchingOrderItem = orderItemIds.find(
                (orderItem) =>
                  orderItem.productId.toString() === cartItem.productId.toString() &&
                  orderItem.color === cartItem.color &&
                  orderItem.storage === cartItem.storage
              );
              if (matchingOrderItem) {
                cartItem.quantity -= matchingOrderItem.quantity;
              }
              return cartItem;
            }).filter((cartItem) => cartItem.quantity > 0); // Xóa sản phẩm nếu quantity <= 0
          } else {
            // Luồng mua từ giỏ hàng: Xóa các sản phẩm trong đơn hàng
            cart.items = cart.items.filter((cartItem) => {
              return !orderItemIds.some(
                (orderItem) =>
                  orderItem.productId.toString() === cartItem.productId.toString() &&
                  orderItem.color === cartItem.color &&
                  orderItem.storage === cartItem.storage
              );
            });
          }

          if (cart.items.length === 0) {
            await Cart.findOneAndDelete({ userId });
          } else {
            await cart.save();
          }
          updatedCart = cart;
        }
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật giỏ hàng:", err.message);
      }
    }

    if (voucherCode) {
      try {
        const voucher = await Promotion.findOne({ code: voucherCode });
        if (voucher) {
          voucher.quantity = Math.max(0, voucher.quantity - 1);
          voucher.usageCount = (voucher.usageCount || 0) + 1;
          await voucher.save();
        } else {
          console.warn("⚠️ Không tìm thấy mã khuyến mãi:", voucherCode);
        }
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật mã khuyến mãi:", err.message);
      }
    }

    if (paymentMethod !== "VNPAY") {
      try {
        await sendOrderConfirmation(email, {
          orderCode,
          customerName,
          address,
          total,
          paymentMethod,
          items,
          phone,
          date: order.date,
        });
      } catch (emailError) {
        console.error("Lỗi khi gửi email xác nhận:", emailError.message);
      }
    }

    if (userId) {
      const notification = new Notification({
        userId,
        message: `Bạn đã đặt hàng thành công với mã đơn ${orderCode}`,
        type: "order",
        role: "user",
        relatedId: order._id,
      });

      try {
        await notification.save();
      } catch (err) {
        console.error("❌ Lỗi khi tạo thông báo user:", err.message);
      }
    }

    const adminNotification = new Notification({
      message: `Khách hàng vừa đặt đơn hàng mới (Mã: ${orderCode})`,
      type: "order",
      role: "admin",
      scope: "admin",
      relatedId: order._id,
    });

    try {
      await adminNotification.save();
    } catch (err) {
      console.error("❌ Lỗi khi tạo thông báo admin:", err.message);
    }

    res.status(201).json({ order, updatedCart });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng" });
  }
};

// Cập nhật thanh toán
exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.isPaid) {
      return res.status(200).json({ message: "Đơn hàng đã được thanh toán" });
    }

    if (order.paymentMethod === "COD" && order.status !== "Giao thành công") {
      return res.status(400).json({
        message: "COD chỉ được thanh toán sau khi giao hàng thành công",
      });
    }

    order.isPaid = true;
    order.paymentStatus = "Đã thanh toán";
    await order.save();

    res.status(200).json({ message: "Cập nhật thanh toán thành công", order });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật thanh toán:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật thanh toán" });
  }
};

// Lấy đơn hàng theo mã đơn hàng
const getOrderByCode = async (req, res) => {
  const { orderCode } = req.params;
  try {
    const order = await Order.findOne({
      orderCode,
      $or: [{ paymentMethod: { $ne: "VNPAY" } }, { isPaid: true }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng với mã này" });
    }

    res.json(order);
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng theo mã:", err);
    res.status(500).json({ message: "Lỗi server khi lấy đơn hàng" });
  }
};

// Lấy đơn hàng theo người dùng
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({
      userId,
      $or: [{ paymentMethod: { $ne: "VNPAY" } }, { isPaid: true }],
    }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử đơn hàng" });
  }
};
