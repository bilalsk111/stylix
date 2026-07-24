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
    updateProductLocally: (state, action) => {
      const updatedProduct = action.payload;

      // Update in allProducts array
      const index = state.allProducts.findIndex(
        (p) => p._id === updatedProduct._id,
      );
      if (index !== -1)
        state.allProducts[index] = {
          ...state.allProducts[index],
          ...updatedProduct,
        };

      // Update in sellerProducts array
      const sellerIndex = state.sellerProducts.findIndex(
        (p) => p._id === updatedProduct._id,
      );
      if (sellerIndex !== -1)
        state.sellerProducts[sellerIndex] = {
          ...state.sellerProducts[sellerIndex],
          ...updatedProduct,
        };
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
export const {
  setSellerProducts,
  setAllProducts,
  setProducts,
  updateProductLocally,
  removeProductLocally,
  removeVariantLocally,
} = productSlice.actions;
export default productSlice.reducer;
