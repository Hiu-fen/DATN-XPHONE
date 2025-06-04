const Product = require('../models/productModels');
const Order = require('../models/orderModel');

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
    const productData = req.body;
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm có trong đơn hàng đang xử lý
    const orders = await Order.find({
      'items.productId': id,
      status: { $nin: ['Hoàn thành', 'Đã huỷ', 'Trả hàng/Hoàn tiền'] },
    });

    if (orders.length > 0) {
      return res.status(400).json({ message: 'Không thể xóa sản phẩm vì đang liên kết với đơn hàng hiện tại' });
    }
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
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm' });
  }
};

// API để trừ số lượng sản phẩm
exports.updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { soluong } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    product.soluong += soluong;
    if (product.soluong < 0) {
      return res.status(400).json({ message: 'Số lượng không đủ trong kho' });
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng sản phẩm' });
  }
};
