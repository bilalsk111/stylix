import express from "express";
import { toggleWishlist, getWishlist } from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

// Wishlist Routes (Protected)
router.post("/toggle", isAuthenticated, toggleWishlist);
router.get("/", isAuthenticated, getWishlist);

export default router;