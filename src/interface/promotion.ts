import { ICategory } from "./category";

export interface Promotion {
  _id: string;            
  name: string;          
  code: string;      
  discountType: string; // Loại giảm giá 
  discountValue?: number | undefined;
  maxDiscount?: number;
  description: string; // Mô tả khuyến mãi
  applicableCategories : ICategory[]; // Các sản phẩm áp dụng
  condition?: string;  // Điều kiện áp dụng
  quantity: number; // Số lượng khuyến mãi
  usageCount?: number; // Số lần đã sử dụng
  maxUsagePerUser:number;
  startDate: Date; // Ngày bắt đầu khuyến mãi
  endDate: Date; // Ngày kết thúc khuyến mãi 
  status: boolean; // Trạng thái khuyến mãi
}
