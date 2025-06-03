export interface IProduct {
  _id?: string;
  name: string;
  image: string;
  albumImages: string[];
  price: number;       // bạn vẫn giữ nếu cần
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
  }[];
}
