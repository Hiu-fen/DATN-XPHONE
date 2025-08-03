const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');


router.delete('/:id/hard', productController.hardDeleteProduct); // Xóa cứng
router.get('/', productController.getAllProducts);
router.get('/search/keyword', productController.searchProducts);
router.get('/deleted', productController.getAllDeleteProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);

router.delete('/:id', productController.deleteProduct); // Xóa mềm

router.get("/:id/check-in-order", productController.checkProductInOrder);
router.patch('/:id/update-quantity', productController.updateProductQuantity);
router.post("/restore-quantity", productController.restoreProductQuantity);
router.post('/reduce-quantity', productController.reduceVariantQuantity);

module.exports = router;