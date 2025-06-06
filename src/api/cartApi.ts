import axios from "axios";

export const addToCart = async ({
  userId,
  productId,
  quantity,
  price,
  color,
  storage,
}: {
  userId: string;
  productId: string;
  quantity: number;
  price: string;
  color?: string;
  storage?: string;
}) => {
  return axios.post("http://localhost:5000/api/carts", {
    userId,
    items: [
      {
        productId,
        quantity,
        price,
        color,
        storage,
      },
    ],
  });
};
