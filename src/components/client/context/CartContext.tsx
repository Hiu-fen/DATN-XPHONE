import { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  soluong: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const saveCartToLocalStorage = (updatedCart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const addToCart = (item: CartItem) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.productId === item.productId
    );
    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cart.map((cartItem) =>
        cartItem.productId === item.productId
          ? { ...cartItem, soluong: cartItem.soluong + 1 }
          : cartItem
      );
    } else {
      updatedCart = [...cart, item];
    }

    saveCartToLocalStorage(updatedCart);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, soluong: quantity } : item
    );
    saveCartToLocalStorage(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    saveCartToLocalStorage(updatedCart);
    message.success("Đã xóa sản phẩm khỏi giỏ hàng.");
  };
  const clearCart = () => {
    saveCartToLocalStorage([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
