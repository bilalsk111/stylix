import { Router } from "express";
import multer from "multer";

import {
  addProductVariant,
  createProduct,
  getAllProducts,
  getProductDetail,
  getSellerProducts,
  editProductVariant, // ✅ FIXED
} from "../controllers/product.controller.js";

import {
  authenticateSeller,
  requireSeller,
} from "../middleware/auth.middleware.js";

import { ProductValidate } from "../validator/product.validator.js";

const router = Router();

// ✅ Better multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  },
});

// =========================
// 📦 PRODUCT ROUTES
// =========================

router.post(
  "/create",
  authenticateSeller,
  requireSeller,
  upload.array("images", 7),
  ProductValidate,
  createProduct
);

router.get(
  "/seller-products",
  authenticateSeller,
  requireSeller, // ✅ FIXED
  getSellerProducts
);

router.get("/", getAllProducts);
router.get("/detail/:id", getProductDetail);

// =========================
// 🎨 VARIANT ROUTES
// =========================

router.post(
  "/:productId/variant",
  authenticateSeller,
  requireSeller,
  upload.array("images", 7),
  addProductVariant
);

router.put(
  "/:productId/variant/:variantId",
  authenticateSeller,
  requireSeller,
  upload.array("images", 7),
  editProductVariant
);

export default router;