import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    sellerProducts: [],
    allProducts: [],
    products: [],
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setSellerProducts: (state, action) => {
      state.sellerProducts = action.payload;
    },
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
    removeProductLocally: (state, action) => {
      const productId = action.payload;
      state.products = state.products.filter((p) => p._id !== productId);
    },
    //Remove specific variant from a product
    removeVariantLocally: (state, action) => {
      const { productId, variantId } = action.payload;
      const product = state.products.find((p) => p._id === productId);
      if (product) {
        product.variants = product.variants.filter((v) => v._id !== variantId);
      }
    },
  },
});
export const { setSellerProducts, setAllProducts, setProducts, removeProductLocally, removeVariantLocally } = productSlice.actions;
export default productSlice.reducer;
