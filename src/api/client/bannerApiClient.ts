import axios from 'axios';

// Địa chỉ gốc của API backend
const BASE_URL = 'http://localhost:5000/api/banners';

export const getAllBanners = () => axios.get(BASE_URL);

 
 