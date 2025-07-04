
require("dotenv").config();
const axios = require("axios");

const GHN_BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api";
const GHN_API_KEY = process.env.GHN_API_KEY;
const SHOP_ID = parseInt(process.env.GHN_SHOP_ID);
const FROM_DISTRICT_ID = parseInt(process.env.GHN_FROM_DISTRICT_ID);


exports.getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${GHN_BASE_URL}/master-data/province`, {
      headers: {
        Token: GHN_API_KEY,
      },
    });
    res.json(response.data.data);
  } catch (error) {
    console.error("Lỗi khi lấy tỉnh/thành:", error.message);
    res.status(500).json({ message: "Không lấy được danh sách tỉnh/thành" });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const provinceId = req.params.provinceId;
    const response = await axios.post(
      `${GHN_BASE_URL}/master-data/district`,
      { province_id: parseInt(provinceId) },
      {
        headers: {
          Token: GHN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data.data);
  } catch (error) {
    console.error("Lỗi khi lấy quận/huyện:", error.message);
    res.status(500).json({ message: "Không lấy được danh sách quận/huyện" });
  }
};

exports.getWards = async (req, res) => {
  try {
    const districtId = req.params.districtId;
    const response = await axios.post(
      `${GHN_BASE_URL}/master-data/ward`,
      { district_id: parseInt(districtId) },
      {
        headers: {
          Token: GHN_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data.data);
  } catch (error) {
    console.error("Lỗi khi lấy phường/xã:", error.message);
    res.status(500).json({ message: "Không lấy được danh sách phường/xã" });
  }
};




exports.calculateShippingFee = async (req, res) => {
  try {
    const GHN_API_KEY = process.env.GHN_API_KEY;
    const SHOP_ID = Number(process.env.GHN_SHOP_ID);
    const FROM_DISTRICT_ID = Number(process.env.GHN_FROM_DISTRICT_ID);

    const { toDistrictId, toWardCode, height = 15, length = 15, weight = 500, width = 15 } = req.body;

    console.log("🟡 GHN Params:", {
      GHN_API_KEY,
      SHOP_ID,
      FROM_DISTRICT_ID,
      toDistrictId,
      toWardCode
    });

    // B1: Lấy service_id phù hợp
    const serviceRes = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
      {
        from_district_id: FROM_DISTRICT_ID,
        to_district_id: Number(toDistrictId)
      },
      {
        headers: {
          Token: GHN_API_KEY,
          ShopId: SHOP_ID
        }
      }
    );

    const services = serviceRes.data.data;
    if (!services || services.length === 0) {
      return res.status(400).json({ message: "Không có dịch vụ vận chuyển phù hợp" });
    }

    const serviceId = services[0].service_id;

    // B2: Tính phí giao hàng
    const feeRes = await axios.post(
      "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
      {
        service_id: serviceId,
        insurance_value: 1000000,
        from_district_id: FROM_DISTRICT_ID,
        to_district_id: Number(toDistrictId),
        to_ward_code: String(toWardCode),
        height,
        length,
        weight,
        width
      },
      {
        headers: {
          "Content-Type": "application/json",
          Token: GHN_API_KEY,
          ShopId: SHOP_ID
        }
      }
    );

    res.json({ fee: feeRes.data.data.total });
  } catch (error) {
    console.error("❌ Lỗi tính phí ship:", error.response?.data || error.message);
    res.status(500).json({ message: "Lỗi khi tính phí vận chuyển" });
  }
};




