const Product = require('../models/productModels');
const Category = require('../models/categoryModels');

// Lấy tất cả sản phẩm cho trang client
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('danhmuc', 'name image')
      .select('name price image trangthai danhmuc');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy danh sách sản phẩm." });
  }
};

// Lấy chi tiết sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('danhmuc', 'name image')
      .select('name price image albumImages mota trangthai danhmuc');
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy thông tin sản phẩm." });
  }
};

// Lấy sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ danhmuc: req.params.categoryId })
      .populate('danhmuc', 'name image')
      .select('name price image trangthai danhmuc');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy danh sách sản phẩm theo danh mục." });
  }
};

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .select('name image mota');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy danh sách danh mục." });
  }
};

// Lấy danh mục theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .select('name image mota');
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể lấy thông tin danh mục." });
  }
};

// Tìm kiếm và lọc sản phẩm
exports.searchProducts = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice, status } = req.query;
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.danhmuc = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (status) {
      query.trangthai = status;
    }

    const products = await Product.find(query).populate('danhmuc');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ, không thể tìm kiếm sản phẩm." });
  }
};
