const axios = require("axios");

const GHN_TOKEN = process.env.GHN_TOKEN;

const getProvinces = async () => {
  const response = await axios.get(
    "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
    {
      headers: {
        Token: GHN_TOKEN,
      },
    }
  );
  return response.data.data;
};

const getDistricts = async (province_id) => {
  const response = await axios.post(
    "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
    { province_id },
    {
      headers: {
        Token: GHN_TOKEN,
      },
    }
  );
  return response.data.data;
};

const getWards = async (district_id) => {
  const response = await axios.post(
    "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
    { district_id },
    {
      headers: {
        Token: GHN_TOKEN,
      },
    }
  );
  return response.data.data;
};

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
};
