export interface IProduct {
  id: number;
  name: string;
  image: string;
  danhmuc: string|number|null;
  // categoryI: string|null
  price: string;
  trangthai:string;
  albumId?: number;  
  mota:string;
  type: string;
  parent: number;
  score:number
}