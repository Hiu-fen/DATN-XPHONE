export interface ICartItem {
    image: string;
    productName: string;
    _id: string;         
    productId: string;
    quantity: number;
    price: number;
    color: string;
    storage: string;
    categoryId?: string;
}
