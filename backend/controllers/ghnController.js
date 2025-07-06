const axios = require("axios");

const calculateShippingFee = async (req, res) => {
  try {
    const { to_district_id, to_ward_code, weight = 1000, insurance_value = 0 } = req.body;

    const response = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
      {
        service_type_id: 2, // bạn có thể đổi loại dịch vụ sau
        from_district_id: 1442, // quận/huyện nơi kho hàng của bạn (VD: Quận 1)
        to_district_id,
        to_ward_code,
        height: 15,
        length: 15,
        weight,
        width: 15,
        insurance_value,
      },
      {
        headers: {
          Token: process.env.GHN_TOKEN,
          ShopId: process.env.GHN_SHOP_ID,
          "Content-Type": "application/json",
        },
      }
    );

    const fee = response.data.data.total;
    return res.json({ success: true, shippingFee: fee });
  } catch (error) {
    console.error("GHN Fee Error:", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Không tính được phí GHN" });
  }
};

module.exports = { calculateShippingFee };
