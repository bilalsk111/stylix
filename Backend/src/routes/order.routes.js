import express from "express";
import { deleteOrderAdmin, getAllOrdersAdmin, getMyOrders, updateOrderStatusAdmin } from "../controllers/order.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js"; 
import { requireSeller } from "../middleware/auth.middleware.js";
const router = express.Router();

// Fetch all orders (Only logged-in Sellers)
router.get("/seller/all", isAuthenticated, requireSeller, getAllOrdersAdmin);

// Update order status (Only logged-in Sellers)
router.put("/seller/:id/status", isAuthenticated, requireSeller, updateOrderStatusAdmin);

// Delete order (Only logged-in Sellers)
router.delete("/seller/:id", isAuthenticated, requireSeller, deleteOrderAdmin);

// Get logged-in user's orders (For Buyer Profile)
router.get("/my-orders", isAuthenticated, getMyOrders);

export default router;