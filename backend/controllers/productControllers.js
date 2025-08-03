const axios = require("axios");
const Product = require('../models/productModels');
const Order = require('../models/orderModel');
const Notification = require('../models/notificationModels');
const { autoDeleteOldProducts } = require('../utils/scheduler');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: true }); // chỉ lấy sản phẩm còn bán
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
};

exports.getAllDeleteProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: false }); // chỉ lấy sản phẩm không còn bán
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log("➡️ Data gửi lên:", req.body);
    const productData = req.body;

    const requiredFields = ["name", "image", "albumImages", "danhmuc", "price", "trangthai"];
    for (const field of requiredFields) {
      if (
        productData[field] === undefined ||
        productData[field] === null ||
        (Array.isArray(productData[field]) && productData[field].length === 0) ||
        (typeof productData[field] === "string" && productData[field].trim() === "")
      ) {
        return res
          .status(400)
          .json({ message: `Thiếu trường bắt buộc: ${field}` });
      }
    }

    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp ít nhất một biến thể" });
    }

    for (let i = 0; i < productData.variants.length; i++) {
      const v = productData.variants[i];
      if (
        !v.color ||
        typeof v.color !== "string" ||
        !v.ram ||
        typeof v.ram !== "string" ||
        v.price == null ||
        typeof v.price !== "number" ||
        v.soluong == null ||
        typeof v.soluong !== "number"
      ) {
        return res.status(400).json({
          message: `Biến thể thứ ${i + 1} không hợp lệ. Cần có color (string), ram (string), price (number), soluong (number).`,
        });
      }
    }

    const totalQuantity = productData.variants.reduce(
      (sum, v) => sum + Number(v.soluong),
      0
    );
    productData.soluong = totalQuantity;

    const product = new Product(productData);
    const savedProduct = await product.save();

    if (global._io) {
      global._io.emit("productCreated", savedProduct);
    }

    await Notification.create({
      message: `Sản phẩm "${savedProduct.name}" vừa mới được ra mắt`,
      type: 'product',
      scope: 'user',
      role: 'user',
      relatedId: savedProduct._id,
    });

    return res.status(201).json(savedProduct);
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server khi thêm sản phẩm" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (Array.isArray(updatedData.variants)) {
      for (let i = 0; i < updatedData.variants.length; i++) {
        const v = updatedData.variants[i];
        if (
          !v.color ||
          typeof v.color !== "string" ||
          !v.ram ||
          typeof v.ram !== "string" ||
          v.price == null ||
          typeof v.price !== "number" ||
          v.soluong == null ||
          typeof v.soluong !== "number"
        ) {
          return res.status(400).json({
            message: `Biến thể thứ ${i + 1} không hợp lệ. Cần có color (string), ram (string), price (number), soluong (number).`,
          });
        }
      }

      const totalQuantity = updatedData.variants.reduce(
        (sum, v) => sum + Number(v.soluong),
        0
      );
      updatedData.soluong = totalQuantity;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }

    if (global._io) {
      global._io.emit("productUpdated", updatedProduct);
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (global._io) {
      global._io.emit("productDeleted", product._id);
    }

    res.json({ message: "Xóa mềm thành công", product });
  } catch (error) {
    console.error("Lỗi khi xóa mềm:", error);
    res.status(500).json({ message: "Xóa thất bại", error });
  }
};

exports.hardDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🔥 Bắt đầu xóa cứng sản phẩm ID:", id);

    // Validate ID format
    if (!id || id.length !== 24) {
      console.log("❌ ID không hợp lệ:", id);
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(id);
    if (!product) {
      console.log("❌ Không tìm thấy sản phẩm với ID:", id);
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    console.log("✅ Tìm thấy sản phẩm:", product.name);

    // Xóa vĩnh viễn khỏi cơ sở dữ liệu
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      console.log("❌ Không thể xóa sản phẩm");
      return res.status(500).json({ message: "Không thể xóa sản phẩm" });
    }

    console.log("✅ Đã xóa sản phẩm thành công");

    // Gửi sự kiện socket (nếu có)
    try {
      if (global._io) {
        global._io.emit("productHardDeleted", id);
        console.log("✅ Đã gửi socket event");
      }
    } catch (socketError) {
      console.log("⚠️ Lỗi khi gửi socket event:", socketError.message);
    }

    // Tạo thông báo (nếu có model Notification)
    try {
      await Notification.create({
        message: `Sản phẩm "${product.name}" đã bị xóa vĩnh viễn`,
        type: 'delete',
        scope: 'admin',
        role: 'admin',
        relatedId: id,
      });
      console.log("✅ Đã tạo notification");
    } catch (notificationError) {
      console.log("⚠️ Lỗi khi tạo notification:", notificationError.message);
    }

    res.json({ 
      message: "Xóa cứng thành công",
      deletedProduct: {
        _id: deletedProduct._id,
        name: deletedProduct.name
      }
    });

  } catch (error) {
    console.error("❌ Lỗi khi xóa cứng:", error);
    res.status(500).json({ 
      message: "Lỗi khi xóa cứng", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
};

exports.restoreProductQuantity = async (req, res) => {
  try {
    const items = req.body.items;

    for (const item of items) {
      const { productId, color, ram, quantity } = item;

      if (!color || !ram) {
        continue;
      }

      const product = await Product.findById(productId);
      if (!product) continue;

      const variant = product.variants.find(
        (v) => v.color === color && v.ram === ram
      );

      if (!variant) {
        continue;
      }

      variant.soluong += Number(quantity);
      product.markModified("variants");

      product.soluong = product.variants.reduce((sum, v) => sum + v.soluong, 0);
      await product.save();
    }

    res.status(200).json({ message: "Khôi phục số lượng biến thể thành công" });
  } catch (error) {
    console.error("❌ Lỗi khôi phục số lượng biến thể:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    
    const products = await Product.find({
      name: { $regex: keyword, $options: "i" },
      status: true,
    });

    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm sản phẩm" });
  }
};

exports.checkProductInOrder = async (req, res) => {
  try {
    const found = await Order.findOne({ "items.productId": req.params.id });
    res.json({ inOrder: !!found }); // trả về true/false
  } catch (err) {
    res.status(500).json({ message: "Lỗi kiểm tra đơn hàng" });
  }
};

exports.updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { color, ram, soluong } = req.body;

    const quantityNumber = Number(soluong);
    if (!soluong || isNaN(quantityNumber)) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const variant = product.variants.find(
      (v) => v.color === color && v.ram === ram
    );

    if (!variant) {
      return res.status(400).json({ message: "Không tìm thấy phiên bản sản phẩm" });
    }

    variant.soluong += quantityNumber;

    product.markModified('variants');

    product.soluong = product.variants.reduce((total, v) => total + v.soluong, 0);

    await product.save();
    res.status(200).json({ message: "Cập nhật thành công", product });
  } catch (error) {
    console.error("🔥 Lỗi cập nhật số lượng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật số lượng" });
  }
};

exports.reduceVariantQuantity = async (req, res) => {
  try {
    const items = req.body.items;

    for (const item of items) {
      const { productId, color, storage, soluong } = item;

      const product = await Product.findById(productId);
      if (!product) continue;

      const variant = product.variants.find(
        (v) =>
          v.color?.trim().toLowerCase() === color?.trim().toLowerCase() &&
          v.ram?.trim().toLowerCase() === storage?.trim().toLowerCase()
      );

      if (!variant) continue;

      variant.soluong = Math.max(0, variant.soluong - Number(soluong));
      product.markModified("variants");

      product.soluong = product.variants.reduce(
        (sum, v) => sum + v.soluong,
        0
      );

      await product.save();
    }

    res.json({ message: "Đã trừ số lượng tồn kho thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi trừ tồn kho:", error);
    res.status(500).json({ message: "Lỗi server khi trừ tồn kho" });
  }
}