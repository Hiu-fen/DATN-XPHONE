const axios = require("axios");
const Product = require('../models/productModels');
const Order = require('../models/orderModel');
const Notification = require('../models/notificationModels');

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
    // req.body phải có: { name, image, albumImages, soluong, mota, danhmuc, price, trangthai, variants: [...] }
    const productData = req.body;

    // 1. Kiểm tra đủ các trường cơ bản (bắt buộc)
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

    // 2. Kiểm tra mảng variants có tồn tại ít nhất một phần tử hay không.
    if (!Array.isArray(productData.variants) || productData.variants.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp ít nhất một biến thể" });
    }

    // 3. Validate từng biến thể: mỗi variant phải có color, ram, price và soluong
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

    // 4. Tính tổng soluong từ các biến thể
    const totalQuantity = productData.variants.reduce(
      (sum, v) => sum + Number(v.soluong),
      0
    );
    // Ghi đè hoặc gán lại productData.soluong:
    productData.soluong = totalQuantity;

    // 5. Tạo đối tượng mới và lưu vào database
    const product = new Product(productData);
    const savedProduct = await product.save();

    // ✅ Tạo thông báo mới cho user
    await Notification.create({
      message: `Sản phẩm "${savedProduct.name}" vừa mới được ra mắt`,
      type: 'product', // hoặc 'success'
      scope: 'user',
      role: 'user',
      relatedId: savedProduct._id,
    });

    // 6. Trả về kết quả
    return res.status(201).json(savedProduct);
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi server khi thêm sản phẩm" });
  }
};


// Sửa sản phẩm theo id


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; 
    // updatedData ví dụ: { name, image, albumImages, price, soluong (có thể bỏ), mota, danhmuc, trangthai, variants: [...] }

    // 1. Nếu có mảng variants trong req, tính lại tổng soluong
    if (Array.isArray(updatedData.variants)) {
      // Validate từng biến thể trước
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

      // Tính tổng soluong từ variants
      const totalQuantity = updatedData.variants.reduce(
        (sum, v) => sum + Number(v.soluong),
        0
      );
      updatedData.soluong = totalQuantity;
    }

    // 2. Cập nhật sản phẩm (bao gồm trường soluong mới)
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
  }
};



// exports.deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Kiểm tra sản phẩm có trong đơn hàng đang xử lý
//     const orders = await Order.find({
//       'items.productId': id,
//       status: { $nin: ['Hoàn thành', 'Đã huỷ', 'Trả hàng/Hoàn tiền'] },
//     });

//     if (orders.length > 0) {
//       return res.status(400).json({ message: 'Không thể xóa sản phẩm vì đang liên kết với đơn hàng hiện tại' });
//     }
//     const deletedProduct = await Product.findByIdAndUpdate(
//   id,
//   { status: false },
//   { new: true }
// );

//     if (!deletedProduct) {
//       return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
//     }

//     res.json({ message: 'Xóa mềm thành công (status = false)' });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
//   }
// };


exports.deleteProduct = async (req, res) => {
  try {
    // Cho phép xóa mềm không kiểm tra đơn hàng
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Xóa mềm thành công", product });
  } catch (error) {
    console.error("Lỗi khi xóa mềm:", error);
    res.status(500).json({ message: "Xóa thất bại", error });
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
    // console.log("🟢 Dữ liệu nhận để khôi phục:", items);

    for (const item of items) {
      // console.log("➡️ Đang xử lý:", item);
      const { productId, color, ram, quantity } = item;

      if (!color || !ram) {
        // console.warn("⚠️ Dữ liệu thiếu thông tin biến thể:", item);
        continue;
      }

      const product = await Product.findById(productId);
      if (!product) continue;

      const variant = product.variants.find(
        (v) => v.color === color && v.ram === ram
      );

      if (!variant) {
        // console.warn(`❌ Không tìm thấy biến thể phù hợp: color=${color}, ram=${ram}`);
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







// Tìm kiếm sản phẩm theo từ khoá (query string: ?keyword=...)
exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    
    // Tìm kiếm trong tên sản phẩm (không phân biệt hoa thường) và sản phẩm còn hoạt động
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

    // 👉 Cập nhật vào variant
    variant.soluong += quantityNumber;

    // ✅ THÊM DÒNG NÀY để Mongoose biết bạn đã thay đổi
    product.markModified('variants');

    // 👉 Cập nhật lại tổng số lượng sản phẩm
    product.soluong = product.variants.reduce((total, v) => total + v.soluong, 0);

    await product.save();
    res.status(200).json({ message: "Cập nhật thành công", product });
  } catch (error) {
    console.error("🔥 Lỗi cập nhật số lượng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật số lượng" });
  }
};



