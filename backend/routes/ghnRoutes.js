const express = require("express");
const router = express.Router();
const { calculateShippingFee } = require("../controllers/ghnController");

router.post("/calculate-fee", calculateShippingFee);

module.exports = router;
