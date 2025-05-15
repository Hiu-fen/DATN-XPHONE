export interface Promotion {
  id: string;            
  name: string;          
  code: string;      
  discountType: string; // Loại giảm giá 
  description: string; // Mô tả khuyến mãi
  applicableProducts: string; // Các sản phẩm áp dụng
  condition?: string;  // Điều kiện áp dụng
  startDate: string;    
  endDate: string;       
  status: string; // Trạng thái khuyến mãi
}
