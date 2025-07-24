// src/api/bannerApi.ts
import axios from 'axios';

// Địa chỉ gốc của API backend cho banner
const BASE_URL = 'http://localhost:5000/api/banners';

export const getAllBanners = () => axios.get(BASE_URL);

export const getBannerById = (id: string) => axios.get(`${BASE_URL}/${id}`);

export const addBanner = (data: any) => axios.post(BASE_URL, data);

export const updateBanner = (id: string, data: any) => axios.put(`${BASE_URL}/${id}`, data);

export const deleteBanner = (id: string) => axios.delete(`${BASE_URL}/${id}`);

// Cập nhật trạng thái banner (bật/tắt)
export const updateBannerStatus = (id: string, status: boolean) => {
  return axios.patch(`${BASE_URL}/status/${id}`, { status });
};
