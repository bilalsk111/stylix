import express from "express";
import { cancelMyOrder, createOrder, deleteOrderAdmin, getAllOrdersAdmin, getMyOrders, razorpayWebhook, updateOrderStatusAdmin, verifyPaymentController } from "../controllers/order.controller.js";
import { isAuthenticated, requireSeller } from "../middleware/auth.middleware.js"; 

const router = express.Router();

router.get("/seller/all", isAuthenticated, requireSeller, getAllOrdersAdmin);
router.put("/seller/:id/status", isAuthenticated, requireSeller, updateOrderStatusAdmin);
router.delete("/seller/:id", isAuthenticated, requireSeller, deleteOrderAdmin);

router.get("/my-orders", isAuthenticated, getMyOrders);
router.put('/my-orders/:orderId/cancel', isAuthenticated, cancelMyOrder);

router.post('/create-order', isAuthenticated, createOrder);
router.post('/verify-payment', isAuthenticated, verifyPaymentController);

router.post("/webhook", razorpayWebhook);

export default router;