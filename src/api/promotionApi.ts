import axios from 'axios';

// Địa chỉ gốc của API backend
const BASE_URL = 'http://localhost:5000/api/promotions';

export const getAllPromotions = () => axios.get(BASE_URL);

export const getPromotionById = (id: string) => axios.get(`${BASE_URL}/${id}`);

export const addPromotion = (data: any) => axios.post(BASE_URL, data);

export const updatePromotion = (id: string, data: any) => axios.put(`${BASE_URL}/${id}`, data);

export const deletePromotion = (id: string) => axios.delete(`${BASE_URL}/${id}`);

export const getRandomCode = () => axios.get(`${BASE_URL}/random-code`);

export const getAllCategory = () => axios.get('http://localhost:5000/api/category');

export const updatePromotionStatus = (id: string, status: boolean) => {
  return axios.patch(`${BASE_URL}/${id}/status`, { status });
};

 
 