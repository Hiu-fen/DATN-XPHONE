const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lấy danh sách đơn hàng
router.get('/', orderController.getAllOrders);

// Lấy đơn hàng theo id
router.get('/:id', orderController.getOrderById);

// Thêm đơn hàng mới
// router.post('/', orderController.createOrder);


// Cập nhật trạng thái đơn hàng
router.patch('/:id', orderController.updateOrderStatus);



// Thêm đơn hàng mới
// router.post('/', orderController.createOrder);


// Cập nhật trạng thái đơn hàng
router.patch('/:id', orderController.updateOrderStatus);




module.exports = router;
