import axios from 'axios';

// Địa chỉ gốc của API backend
const BASE_URL = 'http://localhost:5000/api/banners';

export const getAllBanners = () => axios.get(BASE_URL);

// Lấy danh sách banner đang hoạt động & lọc theo vị trí (nếu có)
export const getActiveBanners = (position?: string) => {
  const url = position ? `${BASE_URL}/active?position=${position}` : `${BASE_URL}/active`;
  return axios.get(url);
};


 
 