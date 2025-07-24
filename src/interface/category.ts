export interface ICategory {
  _id: string;
  name: string;
  mota: string;
  image: string;
  type: string;
  parent: string | null; // Nếu bạn dùng nested category
}
