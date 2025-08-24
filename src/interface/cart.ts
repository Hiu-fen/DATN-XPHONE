export interface ICartItem {
  _id: string;
  productId: string;
  quantity: number;
  price: number;
  color: string;
  storage: string;
  categoryId: string;

  snapshot?: {
    name: string;
    image: string;
    price: number;
    color: string;
    storage: string;
    categoryId: string;
  };
  
  productName?: string;
  image?: string;
}
