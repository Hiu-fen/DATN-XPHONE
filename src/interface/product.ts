export interface IProduct {
  id: number;
  name: string;
  image: string;
  danhmuc: string;
  price: string;
  trangthai:string;
  albumId?: number;  
  mota:string;
  type: string;
  parent: number;
  score:number
}