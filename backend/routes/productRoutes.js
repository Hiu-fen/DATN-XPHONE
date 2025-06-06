const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
// cập nhật số lượng(0rder-Thế Anh)
router.patch('/:id/update-quantity', productController.updateProductQuantity);


module.exports = router;