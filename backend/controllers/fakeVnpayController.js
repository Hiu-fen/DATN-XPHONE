


const createVnpayUrl = (req, res) => {
  const orderCode = req.body.orderCode || "FAKE123";
  const fakePaymentUrl = `http://localhost:5000/api/vnpay/vnpay_return?vnp_ResponseCode=00&vnp_TxnRef=${orderCode}&vnp_SecureHash=FAKE`;

  return res.json({
    paymentUrl: fakePaymentUrl,
  });
};

const vnpayReturn = (req, res) => {
  const orderCode = req.query.vnp_TxnRef;
  return res.json({
    success: true,
    message: "✅ Thanh toán thành công (FAKE)",
    orderCode,
    orderId: "FAKE_ORDER_ID",
  });
};

const verifyVnpayReturn = (req, res) => {
  const orderCode = req.query.vnp_TxnRef;
  return res.json({
    success: true,
    message: "✅ Đã xác minh thanh toán (FAKE)",
    orderCode,
  });
};

module.exports = {
  createVnpayUrl,
  vnpayReturn,
  verifyVnpayReturn,
};
