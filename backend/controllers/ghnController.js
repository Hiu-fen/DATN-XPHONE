// controllers/ghnController.js
require('dotenv').config();
const axios = require('axios');

const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;
const FROM_DISTRICT_ID = process.env.FROM_DISTRICT_ID || 3440;

console.log('GHN_TOKEN:', GHN_TOKEN);
console.log('SHOP_ID:', GHN_SHOP_ID); // ✅ đúng với tên biến bạn đã khai báo


const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(
      'https://online-gateway.ghn.vn/shiip/public-api/master-data/province',
      { headers: { Token: GHN_TOKEN } }
    );
    res.json(response.data.data);
  } catch (err) {
    console.error('Lỗi lấy tỉnh:', err.message);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách tỉnh' });
  }
};

const getDistricts = async (req, res) => {
  try {
    const { province_id } = req.query;
    const resp = await axios.get(
      'https://online-gateway.ghn.vn/shiip/public-api/master-data/district',
      { headers: { Token: GHN_TOKEN } }
    );
    res.json(resp.data.data.filter(d => d.ProvinceID == province_id));
  } catch (err) {
    console.error('Lỗi lấy quận:', err.message);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách quận' });
  }
};

const getWards = async (req, res) => {
  try {
    const { district_id } = req.query;
    const resp = await axios.get(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${district_id}`,
      { headers: { Token: GHN_TOKEN } }
    );
    res.json(resp.data.data);
  } catch (err) {
    console.error('Lỗi lấy phường:', err.message);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phường' });
  }
};

const calculateShippingFee = async (req, res) => {
  const { to_district_id, to_ward_code, weight, insurance_value } = req.body;

  if (!to_district_id || !to_ward_code) {
    return res.status(400).json({ message: 'Thiếu địa chỉ nhận hàng' });
  }

  try {
    const serviceRes = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
      {
        from_district: Number(FROM_DISTRICT_ID),
        to_district: Number(to_district_id)
      },
      {
        headers: {
          Token: GHN_TOKEN,
          ShopId: GHN_SHOP_ID
        }
      }
    );

    const service_id = serviceRes.data.data?.[0]?.service_id;

    if (!service_id) {
      return res.status(400).json({ message: 'Không tìm thấy dịch vụ GHN' });
    }

    console.log("=== 📦 Body từ FE gửi lên:", req.body);
    console.log("GHN_TOKEN:", process.env.GHN_TOKEN);
    console.log("SHOP_ID:", process.env.SHOP_ID);

    const feeRes = await axios.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
      {
        service_id,
        from_district_id: Number(FROM_DISTRICT_ID),
        to_district_id: Number(to_district_id),
        to_ward_code: String(to_ward_code),
        weight,
        insurance_value,
        length: 15,
        width: 15,
        height: 15,
      },
      {
        headers: {
    'Content-Type': 'application/json',
    Token: GHN_TOKEN,
    'ShopId': Number(GHN_SHOP_ID),
  },
      }
    );

    res.json({ shippingFee: feeRes.data.data.total });

  } catch (err) {
    console.error("❌ Lỗi GHN shipping fee:", err?.response?.data || err.message);
    res.status(500).json({
      message: "Lỗi server khi tính phí vận chuyển",
      error: err?.response?.data || err.message,
    });
  }
};


module.exports = { getProvinces, getDistricts, getWards, calculateShippingFee };
