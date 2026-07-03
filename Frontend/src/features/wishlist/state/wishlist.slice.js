import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // Sirf Product IDs ki array rakhenge -> ['id1', 'id2']
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    toggleLocalWishlist: (state, action) => {
      const productId = action.payload;
      if (state.items.includes(productId)) {
        state.items = state.items.filter((id) => id !== productId);
      } else {
        state.items.push(productId);
      }
    },
    clearWishlist: (state) => {
      state.items = [];
    }
  },
});

export const { setWishlist, toggleLocalWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;