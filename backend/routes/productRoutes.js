const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

router.get('/', productController.getAllProducts);
router.get('/deleted', productController.getAllDeleteProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get("/:id/check-in-order", productController.checkProductInOrder);
// cập nhật số lượng(0rder-Thế Anh)
router.patch('/:id/update-quantity', productController.updateProductQuantity);


module.exports = router;