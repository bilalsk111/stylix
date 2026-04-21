import { Router } from "express";
import { authenticateSeller, requireSeller } from "../middleware/auth.middleware.js";
import multer from "multer"
import { addProductVariant, createProduct, getAllProducts, getProductDetail, getSellerProducts } from "../controllers/product.controller.js";
import { ProductValidate } from "../validator/product.validator.js";
let router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

router.post(
    '/create',
    authenticateSeller,
      requireSeller,
    upload.array("images", 7),  
    ProductValidate,          
   createProduct
);
router.get(
  '/seller-products',
  authenticateSeller,
  getSellerProducts
);
router.get("/", getAllProducts);
router.get("/detail/:id", getProductDetail);

router.post(
    '/:productId/variant',
    authenticateSeller,
      requireSeller,
    upload.array("images", 7),  
    addProductVariant
);

export default router;