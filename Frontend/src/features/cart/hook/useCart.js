// features/cart/hook/useCart.js
import { addItem as addItemAPI, getCart } from "../services/cart.api";
import { useDispatch } from "react-redux";
import { setItems } from "../state/cart.slice";
import { useEffect } from "react";

export const useCart = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    async function loadCart() {
      try {
        const data = await getCart();
        // Backend structure ke hisaab se robust check
        const items = data.items || data.cart?.items || (Array.isArray(data) ? data : []);
        dispatch(setItems(items));
      } catch (err) {
        console.error("Cart load failed", err);
      }
    }
    loadCart();
  }, [dispatch]);

  async function handleAddItem({ productId, variantId, quantity = 1 }) {
    try {
      const res = await addItemAPI({ productId, variantId, quantity });
      // Yahan check karein ki data res.items mein hai ya res mein khud
      const items = res.items || res.cart?.items || (Array.isArray(res) ? res : []);
      
      if (items.length > 0) {
        dispatch(setItems(items));
      } else {
        // Agar backend se items nahi aaye toh dobara fetch karein
        const freshCart = await getCart();
        dispatch(setItems(freshCart.items || freshCart.cart?.items || []));
      }
      return res;
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  }

  return { handleAddItem };
};




async function handleGetCart() {
  const data = await getCart();
  const items = data.items || data.cart?.items || (Array.isArray(data) ? data : []);
  dispatch(setItems(items));
  return data;
}













