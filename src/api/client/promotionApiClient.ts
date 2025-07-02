import axios from 'axios';

// Địa chỉ gốc của API backend
const BASE_URL = 'http://localhost:5000/api/promotions';

export const getPublicPromotions = async () => {
  const { data } = await axios.get(`${BASE_URL}/public`);
  return data;
};

interface IApplyVoucherData {
  code: string;
  total: number;
  userId: string; 
  items: {
    productId: string;
    categoryId?: string;
    quantity: number;
    price: number;
  }[];
}

export const applyVoucherToOrder = (data: IApplyVoucherData) => {
  return axios.post(`${BASE_URL}/apply-voucher-order`, data);
};


 