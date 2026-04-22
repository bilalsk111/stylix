import {Router} from "express"
const router = Router();
import { isAuthenticated } from "../middleware/auth.middleware.js";        
import { validateAddtoCart,validateUpdateCartQty } from "../validator/cart.validator.js";
import { addtocart,getCart, updateCartItemQuantity,removeCartItem  } from "../controllers/cart.controller.js";





router.post('/add/:productId/:variantId',isAuthenticated,validateAddtoCart,addtocart)
router.patch('/qty/:productId/:variantId', isAuthenticated, validateUpdateCartQty, updateCartItemQuantity);
router.delete('/del/:productId/:variantId', isAuthenticated, removeCartItem);
router.get('/',isAuthenticated,getCart)



export default router;