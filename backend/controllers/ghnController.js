const axios = require('axios');

const GHN_TOKEN = process.env.GHN_TOKEN;
const SHOP_ID = process.env.GHN_SHOP_ID;

// Lấy danh sách tỉnh
const getProvinces = async (req, res) => {
  try {
    const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
      headers: {
        'Token': GHN_TOKEN
      }
    });
    res.json(response.data.data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách tỉnh' });
  }
};

// Lấy danh sách quận theo province_id
const getDistricts = async (req, res) => {
  try {
    const { province_id } = req.query;
    const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', {
      headers: {
        'Token': GHN_TOKEN
      }
    });

    const districts = response.data.data.filter(item => item.ProvinceID == province_id);
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách quận/huyện' });
  }
};

// Lấy danh sách phường theo district_id
const getWards = async (req, res) => {
  try {
    const { district_id } = req.query;
    const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=' + district_id, {
      headers: {
        'Token': GHN_TOKEN
      }
    });

    res.json(response.data.data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách phường/xã' });
  }
};

// Tính phí vận chuyển
const calculateShippingFee = async (req, res) => {
  try {
    const {
      to_district_id,
      to_ward_code,
      weight = 1000, // gram
      length = 30,
      width = 20,
      height = 10,
    } = req.body;

    const response = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
      service_type_id: 2, // GHN tiêu chuẩn
      insurance_value: 1000000, // giá trị khai giá đơn hàng
      coupon: null,
      from_district_id: 1452, // ví dụ: Q.1 HCM, bạn nên thay bằng từ backend hoặc config
      to_district_id,
      to_ward_code,
      height,
      length,
      weight,
      width
    }, {
      headers: {
        'Token': GHN_TOKEN,
        'ShopId': SHOP_ID,
        'Content-Type': 'application/json',
      }
    });

    res.json(response.data.data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi tính phí vận chuyển', details: error.response?.data || error.message });
  }
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee
};
