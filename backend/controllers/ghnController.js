// controllers/ghnController.js
require('dotenv').config();
const axios = require('axios');

const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID);
const FROM_DISTRICT_ID = Number(process.env.FROM_DISTRICT_ID);

console.log('GHN_TOKEN:', GHN_TOKEN);
console.log('SHOP_ID:', GHN_SHOP_ID);


exports.getProvinces = async (req, res) => {
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


exports.getDistricts = async (req, res) => {
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


exports.getWards = async (req, res) => {
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

// ================== CALCULATE SHIPPING FEE ==================
exports.calculateShippingFee = async (req, res) => {
  const { to_district_id, to_ward_code, weight, insurance_value } = req.body;

  if (!to_district_id || !to_ward_code) {
    return res.status(400).json({ message: 'Thiếu địa chỉ nhận hàng' });
  }

  try {
    // Gọi API lấy dịch vụ vận chuyển có sẵn
    const serviceRes = await axios.post(
  'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
  {
    shop_id: GHN_SHOP_ID, // ✅ THÊM vào body
    from_district: FROM_DISTRICT_ID,
    to_district: Number(to_district_id)
  },
  {
    headers: {
      'Content-Type': 'application/json',
      token: GHN_TOKEN // ✅ lưu ý chữ thường 'token'
    }
  }
);
    const service_id = serviceRes.data.data?.[0]?.service_id;
    if (!service_id) {
      return res.status(400).json({ message: 'Không tìm thấy dịch vụ GHN' });
    }

    const feeBody = {
      service_id,
      from_district_id: FROM_DISTRICT_ID,
      to_district_id: Number(to_district_id),
      to_ward_code: String(to_ward_code),
      weight,
      insurance_value,
      length: 15,
      width: 15,
      height: 15,
      // ❌ Không cần truyền shop_id ở đây nữa
    };

    console.log("📦 Gửi body fee:", feeBody);

    // Gọi API tính phí vận chuyển
    const feeRes = await axios.post(
  'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
  {
    service_id,
    shop_id: GHN_SHOP_ID, 
    from_district_id: FROM_DISTRICT_ID,
    to_district_id: Number(to_district_id),
    to_ward_code: String(to_ward_code),
    weight,
    insurance_value,
    length: 15,
    width: 15,
    height: 15
  },
  {
    headers: {
      'Content-Type': 'application/json',
      token: GHN_TOKEN // ✅ viết thường
    }
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