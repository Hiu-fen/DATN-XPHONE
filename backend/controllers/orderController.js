const Order = require("../models/orderModel");
const Product = require("../models/productModels");

// Hiển thị list Order
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
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Trừ số lượng sản phẩm khi chuyển sang "Đang xử lý"
    if (status === "Đang xử lý" && order.status !== "Đang xử lý") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Sản phẩm ${item.productName} không tồn tại` });
        }
        if (product.soluong < item.soluong) {
          return res
            .status(400)
            .json({
              message: `Số lượng không đủ cho sản phẩm ${item.productName}`,
            });
        }
        product.soluong -= item.soluong;
        await product.save();
      }
    }

    // Cập nhật statusHistory
    order.status = status;
    order.statusHistory = [
      ...(order.statusHistory || []),
      { status, timestamp: new Date() },
    ];

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng" });
  }
};

// Xử lý yêu cầu trả hàng
exports.updateOrderReturn = async (req, res) => {
  try {
    const { returnStatus, returnReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Cập nhật trạng thái trả hàng và lý do
    order.returnStatus = returnStatus;
    if (returnReason) order.returnReason = returnReason;

    // Nếu duyệt trả hàng, trả số lượng sản phẩm vào kho
    if (returnStatus === 'Đã duyệt') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.soluong += item.soluong; // Cộng lại số lượng vào kho
          await product.save();
        } else {
          // Ghi log hoặc thông báo nếu sản phẩm không tồn tại
          console.warn(`Sản phẩm ${item.productName} (ID: ${item.productId}) không tồn tại khi hoàn kho`);
        }
      }
      order.status = 'Trả hàng/Hoàn tiền';
      order.statusHistory = [
        ...(order.statusHistory || []),
        { status: 'Trả hàng/Hoàn tiền', timestamp: new Date() },
      ];
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xử lý trả hàng' });
  }
};

// Client 
// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      items,
      total,
      paymentMethod,
      shippingProvider,
      notes,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!customerName || !phone || !address || !items || !total) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Tạo mã đơn hàng dạng ORD-4J8K9
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 5; i++) {
      randomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const orderCode = `ORD-${randomCode}`;

    // Kiểm tra mã đơn hàng duy nhất
    const existingOrder = await Order.findOne({ orderCode });
    if (existingOrder) {
      return res.status(400).json({ message: 'Mã đơn hàng đã tồn tại, thử lại' });
    }

    // Kiểm tra số lượng sản phẩm trong kho
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.productName} không tồn tại` });
      }
      if (product.soluong < item.soluong) {
        return res.status(400).json({ message: `Số lượng không đủ cho sản phẩm ${item.productName}` });
      }
      // Lưu snapshot sản phẩm
      item.snapshot = {
        name: product.name,
        price: product.price,
        image: product.image,
      };
    }

    // Tạo đơn hàng
    const order = new Order({
      orderCode,
      customerName,
      phone,
      address,
      items,
      total,
      paymentMethod,
      shippingProvider,
      notes,
      status: 'Chờ xác nhận',
      statusHistory: [{ status: 'Chờ xác nhận', timestamp: new Date() }],
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng' });
  }
};