const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lấy danh sách đơn hàng
router.get('/', orderController.getAllOrders);

// Lấy đơn hàng theo id
router.get('/:id', orderController.getOrderById);

// Cập nhật trạng thái đơn hàng
router.patch('/:id', orderController.updateOrderStatus);

// Xử lý yêu cầu trả hàng
router.patch('/:id/return', orderController.updateOrderReturn);
// Thêm đơn hàng
router.post('/', orderController.createOrder);
// Cập nhật trạng thái thanh toán
router.patch('/:id/paid', orderController.markAsPaid);


module.exports = router;