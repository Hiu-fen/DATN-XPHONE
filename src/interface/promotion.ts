import { ICategory } from "./category";

export interface Promotion {
  _id: string;            
  name: string;          
  code: string;      
  discountType: string; // Loại giảm giá 
  description: string; // Mô tả khuyến mãi
  applicableCategories : ICategory[]; // Các sản phẩm áp dụng
  condition?: string;  // Điều kiện áp dụng
  quantity: number; // Số lượng khuyến mãi
  startDate: Date;    
  endDate: Date;       
  status: boolean; // Trạng thái khuyến mãi
}
