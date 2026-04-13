import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }
  return value;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev
        .map((entry) => (entry.id === id ? { ...entry, qty } : entry))
        .filter((entry) => entry.qty > 0)
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clearCart = () => setItems([]);

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, entry) => sum + entry.price * entry.qty, 0);
    const fee = subtotal > 0 ? 2.5 : 0;
    const total = subtotal + fee;
    return { subtotal, fee, total };
  }, [items]);

  const value = { items, addItem, updateQty, removeItem, clearCart, summary };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
