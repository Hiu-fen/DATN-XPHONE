import axios from "axios";
import { IProduct } from "../../interface/product";

export const getAllProducts = async (): Promise<IProduct[]> => {
  const res = await fetch("http://localhost:5000/api/products");
  if (!res.ok) throw new Error("Lỗi khi lấy danh sách sản phẩm");
  return res.json();
};

export const searchProducts = async (keyword: string): Promise<IProduct[]> => {
  const res = await axios.get(`http://localhost:5000/api/products/search/keyword`, {
    params: { keyword },
  });
  return res.data;
};