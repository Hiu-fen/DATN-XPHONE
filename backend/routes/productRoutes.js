const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

router.get('/', productController.getAllProducts);
// Tìm kiếm sản phẩm theo từ khóa
router.get('/search/keyword', productController.searchProducts);

// Lấy tất cả sản phẩm đã xóa
router.get('/deleted', productController.getAllDeleteProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get("/:id/check-in-order", productController.checkProductInOrder);


router.patch('/:id/update-quantity', productController.updateProductQuantity);
router.post("/restore-quantity", productController.restoreProductQuantity);




module.exports = router;