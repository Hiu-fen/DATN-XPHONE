const express = require("express");
const { createVnpayUrl, vnpayReturn , verifyVnpayReturn } = require("../controllers/vnpayController");

const router = express.Router();

router.post("/create_payment_url", createVnpayUrl);
router.get("/vnpay_return", vnpayReturn);
router.get("/verify_return", verifyVnpayReturn);

module.exports = router;
