export interface IProduct {
  _id?: string;
  name: string;
  image: string;
  albumImages: string[];
<<<<<<< HEAD
  price: number;      
=======
  price: string;       // bạn vẫn giữ nếu cần
>>>>>>> DATN
  soluong: number;
  mota?: string;
  danhmuc: string;
  trangthai: string;
  status: boolean;

  // Thêm mảng variants
  variants?: {
    color: string;
    ram: string;
    price: number;
    soluong: number;
  }[];
}
