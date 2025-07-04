const express = require("express");
const router = express.Router();

// Check môi trường để dùng controller tương ứng
const isDev = process.env.NODE_ENV !== "production";

const {
  createVnpayUrl,
  vnpayReturn,
  verifyVnpayReturn,
} = isDev
  ? require("../controllers/fakeVnpayController")
  : require("../controllers/vnpayController");

router.post("/create_payment_url", createVnpayUrl);
router.get("/vnpay_return", vnpayReturn);
router.get("/verify_return", verifyVnpayReturn);

module.exports = router;
