const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/return-photos/" }); 
const orderController = require("../controllers/orderController");

// Lấy danh sách đơn hàng
router.get("/", orderController.getAllOrders);

// Lấy đơn hàng theo id
router.get("/:id", orderController.getOrderById);

// Cập nhật trạng thái đơn hàng
router.patch("/:id", orderController.updateOrderStatus);

// Xử lý yêu cầu trả hàng
router.patch("/:id/return", upload.array("images", 10), orderController.updateOrderReturn);
// Thêm đơn hàng
router.post("/", orderController.createOrder);
// Cập nhật trạng thái thanh toán
router.patch("/:id/paid", orderController.markAsPaid);

// Lấy đơn hàng theo userId
router.get('/user/:userId', orderController.getOrdersByUser);
// router.put('/orders/:id/status', updateOrderStatus);



//aloaloaloa nhwos đay nhé 

module.exports = router;
