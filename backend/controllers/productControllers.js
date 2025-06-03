const Product = require('../models/productModels');

// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find(); 
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
//   }
// };
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: true }); // chỉ lấy sản phẩm còn bán
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

    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    // console.error("❌ Lỗi khi thêm sản phẩm:", error.message);
    res.status(500).json({ message: 'Lỗi server khi thêm sản phẩm' });
  }
};


// Sửa sản phẩm theo id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    // updatedData ví dụ: { name, image, albumImages, ..., variants: [ ... ] }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }
    res.json(updatedProduct);
  } catch (error) {
    // console.error("❌ Lỗi khi cập nhật sản phẩm:", error.message);
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
  }
};

// Xóa sản phẩm theo id
// exports.deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedProduct = await Product.findByIdAndDelete(id);

//     if (!deletedProduct) {
//       return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
//     }

//     res.json({ message: 'Xóa sản phẩm thành công' });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
//   }
// };
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndUpdate(id, { status: false }, { new: true });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

    res.json({ message: 'Xóa mềm thành công (status = false)' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
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

