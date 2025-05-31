const Product = require('../models/productModels');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); 
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body; // lấy dữ liệu từ FE
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm' });
  }
};
// Sửa sản phẩm theo id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // lấy id từ params
    const updatedData = req.body; // dữ liệu cập nhật từ FE

    // Tìm và cập nhật sản phẩm, trả về document mới sau khi cập nhật
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
  }
};

// Xóa sản phẩm theo id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm theo id
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
};

