import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice"
import productReducer from '../features/products/state/product.slice'
import cartReducer from '../features/cart/state/cart.slice'
import orderReducer from '../features/order/state/order.slice'

export const store = configureStore({
    reducer:{
        auth:authReducer,
        product:productReducer,
        cart:cartReducer,
        order:orderReducer
    }
})