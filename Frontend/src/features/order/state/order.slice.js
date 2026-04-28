// src/redux/slices/order.slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminOrders: [],
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAdminOrders: (state, action) => {
      state.adminOrders = action.payload;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    updateOrderStatusLocally: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.adminOrders.findIndex((o) => o._id === orderId);
      if (orderIndex !== -1) {
        state.adminOrders[orderIndex].orderStatus = status;
      }
    },
    removeOrderLocally: (state, action) => {
      // action.payload mein orderId aayega. Hum use filter karke nikal denge.
      state.adminOrders = state.adminOrders.filter(
        (order) => order._id !== action.payload,
      );
    },
    setBuyerOrders: (state, action) => {
      state.buyerOrders = action.payload;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setAdminOrders,
  setError,
  updateOrderStatusLocally,
  removeOrderLocally,
  setBuyerOrders
} = orderSlice.actions;
export default orderSlice.reducer;
