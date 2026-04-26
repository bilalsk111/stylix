import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    totalPrice: null,
    currency: null,
    items: [],
  },
  reducers: {
    setCart: (state, action) => {
      // 🔥 FIX: Smart Check - Agar array aa raha hai toh direct items mein dalo, warna object se nikalo
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      } else {
        state.items = action.payload?.items || [];
        state.totalPrice = action.payload?.totalPrice || null;
        state.currency = action.payload?.currency || "INR";
      }
    },
    setItems: (state, action) => {
      // Yahan bhi same smart check laga diya
      state.items = Array.isArray(action.payload) ? action.payload : (action.payload?.items || []);
    },
    addItem: (state, action) => {
      const { productId, variantId } = action.payload;
      const existingItem = state.items.find(
        (item) => (item.product?._id || item.product) === productId && (item.variant?._id || item.variant) === variantId
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    setUpdateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        (item) =>
          (item.product?._id || item.product) === productId &&
          (item.variant?._id || item.variant) === variantId
      );
      if (item) {
        item.quantity = quantity; // UI instantly change ho jayega!
      }
    },
    removeItemLocal: (state, action) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        (item) =>
          !(
            (item.product?._id || item.product) === productId &&
            (item.variant?._id || item.variant) === variantId
          )
      );
    },
  },
});

export const { setCart, setItems, addItem, setUpdateQuantity, removeItemLocal } = cartSlice.actions;
export default cartSlice.reducer;