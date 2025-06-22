const Order = require("../models/orderModel");
const Product = require("../models/productModels");
const axios = require("axios");

// Danh sách đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const currentStatus = order.status;

    // ✅ Nếu chuyển sang huỷ hoặc trả hàng và chưa từng huỷ/trả
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
        const response = await axios.post("http://localhost:5000/api/products/restore-quantity", {
          items: restoreItems,
        });

        console.log("✅ Khôi phục số lượng thành công:", response.data.message);
      } catch (err) {
        console.error("❌ Lỗi khi gọi restore-quantity:", err?.response?.data || err.message);
        return res.status(500).json({ message: "Lỗi khi khôi phục số lượng biến thể" });
      }
    }

    order.status = status;
    order.statusHistory = [
      ...(order.statusHistory || []),
      { status, timestamp: new Date() },
    ];
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng" });
  }
};

// Yêu cầu trả hàng
exports.updateOrderReturn = async (req, res) => {
  try {
    const { returnStatus, returnReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.returnStatus = returnStatus;
    if (returnReason) order.returnReason = returnReason;

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
    res.status(500).json({ message: "Lỗi khi xử lý trả hàng" });
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

    let orderCode = generateOrderCode();
    while (await Order.findOne({ orderCode })) {
      orderCode = generateOrderCode();
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ message: `Sản phẩm ${item.productName} không tồn tại` });
      if (product.soluong < item.soluong) {
        return res.status(400).json({ message: `Không đủ hàng cho sản phẩm ${item.productName}` });
      }

      // ✅ Lưu cả color và storage vào item ngoài snapshot
      item.color = item.color || "";
      item.storage = item.storage || "";

      item.snapshot = {
        name: item.productName,
        price: item.price,
        image: product.image,
        color: item.color,
        storage: item.storage,
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
      status: "Chờ xác nhận",
      statusHistory: [{ status: "Chờ xác nhận", timestamp: new Date() }],
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng" });
  }
};

// Đánh dấu đã thanh toán
exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (order.isPaid) return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });

    if (order.paymentMethod === "COD") {
      return res.status(400).json({ message: "COD chỉ được thanh toán khi giao hàng" });
    }

    if (["Giao thành công", "Đã huỷ", "Trả hàng/Hoàn tiền"].includes(order.status)) {
      return res.status(400).json({ message: "Không thể thanh toán ở trạng thái hiện tại" });
    }

    order.isPaid = true;
    await order.save();

    res.json({ message: "Thanh toán thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật thanh toán" });
  }
};

// Lấy đơn hàng theo người dùng
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử đơn hàng" });
  }
};
