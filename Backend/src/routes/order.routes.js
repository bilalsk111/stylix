import express from "express";
import { cancelMyOrder, createOrder, deleteOrderAdmin, getAllOrdersAdmin, getMyOrders, razorpayWebhook, updateOrderStatusAdmin } from "../controllers/order.controller.js";
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
router.put('/my-orders/:orderId/cancel',isAuthenticated,cancelMyOrder)

router.post('/create-order',isAuthenticated,createOrder)

router.post("/webhook", razorpayWebhook);

export default router;