const express = require('express');
const router = express.Router();
const categoryControllers = require('../controllers/categoryControllers');

// Lấy tất cả danh mục
router.get('/', categoryControllers.getAllCategory);

// Lấy danh mục theo ID
router.get('/:id', categoryControllers.getCategoryById);

// Tạo mới danh mục
router.post('/', categoryControllers.createCategory);

// Cập nhật danh mục theo ID
router.put('/:id', categoryControllers.updateCategory);

// Xóa danh mục theo ID
router.delete('/:id', categoryControllers.deleteCategory);

module.exports = router;
