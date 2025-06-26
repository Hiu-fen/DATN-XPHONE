import axios from 'axios';

// Địa chỉ gốc của API backend
const BASE_URL = 'http://localhost:5000/api/promotions';

interface IApplyVoucherData {
  code: string;
  total: number;
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

 
 