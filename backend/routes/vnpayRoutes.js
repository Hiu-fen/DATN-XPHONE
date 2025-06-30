const express = require("express");
const { createVnpayUrl, vnpayReturn } = require("../controllers/vnpayController");

const router = express.Router();

router.post("/create_payment_url", createVnpayUrl);
router.get("/vnpay_return", vnpayReturn);

module.exports = router;
