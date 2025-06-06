import axios from "axios";

export const addToCart = async ({
  userId,
  productId,
  quantity,
  color,
  storage,
}: {
  userId: string;
  productId: string;
  quantity: number;
  color?: string;
  storage?: string;
}) => {
  return axios.post("http://localhost:5000/api/carts", {
    userId,
    items: [
      {
        productId,
        quantity,
        color,
        storage,
      },
    ],
  });
};
