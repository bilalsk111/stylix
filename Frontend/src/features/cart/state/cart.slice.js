import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    addItem: (state, action) => {
      const { productId, variantId } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product === productId && item.variant === variantId
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    setUpdateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      // FIX: Proper matching logic
      const item = state.items.find(
        (item) => (item.product?._id || item.product) === productId && 
                  (item.variant?._id || item.variant) === variantId
      );
      if (item) {
        item.quantity = quantity; // UI instantly change ho jayega!
      }
    },
    removeItemLocal: (state, action) => {
      const { productId, variantId } = action.payload;
      // FIX: Filter unhe karega jo match nahi karte
      state.items = state.items.filter(
        (item) => !((item.product?._id || item.product) === productId && 
                    (item.variant?._id || item.variant) === variantId)
      );
    }
  },
});

// FIX: Naye reducers export karna mat bhulna
export const { setItems, addItem, setUpdateQuantity, removeItemLocal } = cartSlice.actions;
export default cartSlice.reducer;