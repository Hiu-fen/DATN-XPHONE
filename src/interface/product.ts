export interface IProduct {
  _id: string; // sửa lại từ number -> string
  name: string;
  image: string;
  danhmuc: string; // sửa lại từ string | number | null -> string
  price: string;
  soluong: string;
  trangthai: string;
  mota: string;
  type: string;
  parent: number;
  score: number;
}
