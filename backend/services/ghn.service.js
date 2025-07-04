const axios = require("axios");

const GHN_API_KEY = process.env.GHN_API_KEY;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;

const GHN_BASE_URL = "https://online-gateway.ghn.vn/shiip/public-api";

const ghnAxios = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    Token: GHN_API_KEY,
    ShopId: GHN_SHOP_ID,
  },
});

exports.getProvinces = () => ghnAxios.get("/master-data/province");
exports.getDistricts = (provinceId) =>
  ghnAxios.post("/master-data/district", { province_id: provinceId });

exports.getWards = (districtId) =>
  ghnAxios.post("/master-data/ward", { district_id: districtId });
