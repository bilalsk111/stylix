// features/cart/hook/useCart.js
import { 
  addItem as addItemAPI, 
  getCart, 
  updateCartItemQuantity, 
  removeCartItem // Yeh import zaroori hai!
} from "../services/cart.api";
import { useDispatch } from "react-redux";
import { setItems, setUpdateQuantity, removeItemLocal } from "../state/cart.slice";
import { useEffect, useCallback } from "react";

export const useCart = () => {
  const dispatch = useDispatch();

  const handleGetCart = useCallback(async () => {
    try {
      const data = await getCart();
      const items = data.items || data.cart?.items || (Array.isArray(data) ? data : []);
      dispatch(setItems(items));
      return data;
    } catch (err) {
      console.error("Cart load failed", err);
    }
  }, [dispatch]);

  useEffect(() => {
    handleGetCart();
  }, [handleGetCart]);

  async function handleAddItem({ productId, variantId, quantity = 1 }) {
    try {
      const res = await addItemAPI({ productId, variantId, quantity });
      const items = res.items || res.cart?.items || (Array.isArray(res) ? res : []);
      
      if (items.length > 0) {
        dispatch(setItems(items));
      } else {
        await handleGetCart();
      }
      return res;
    } catch (err) {
      console.error("Add to cart failed", err);
      throw err;
    }
  }

  // FIX: Proper Name and Optimistic Update
  async function handleUpdateItemQty({ productId, variantId, quantity }) {
    // 1. Optimistic Update: UI ko instantly update kar do
    dispatch(setUpdateQuantity({ productId, variantId, quantity }));

    try {
      const data = await updateCartItemQuantity({ productId, variantId, quantity });
      return data;
    } catch (error) {
      console.error("Failed to update qty, rolling back", error);
      await handleGetCart(); 
      throw error;
    }
  }

  async function handleRemoveItem({ productId, variantId }) {
    dispatch(removeItemLocal({ productId, variantId }));

    try {
      const data = await removeCartItem({ productId, variantId });
      return data;
    } catch (error) {
      console.error("Failed to remove item, rolling back", error);
      await handleGetCart();
      throw error;
    }
  }

  return { 
    handleGetCart, 
    handleAddItem, 
    handleUpdateItemQty, 
    handleRemoveItem 
  };
};