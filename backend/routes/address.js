const express = require("express");
const router = express.Router();
const addressCtrl = require("../controllers/address");

router.get('/', addressCtrl.getAllAddresses); // ✅ Thêm dòng này vào đầu

router.get("/:userId", addressCtrl.getAddressesByUser);
router.post("/", addressCtrl.addAddress);
router.patch("/:id", addressCtrl.updateAddress);
router.delete("/:id", addressCtrl.deleteAddress);

module.exports = router;
