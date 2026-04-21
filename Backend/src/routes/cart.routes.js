import {Router} from "express"
const router = Router();
import { isAuthenticated } from "../middleware/auth.middleware.js";        
import { validateAddtoCart } from "../validator/cart.validator.js";
import { addtocart,getCart } from "../controllers/cart.controller.js";





router.post('/add/:productId/:variantId',isAuthenticated,validateAddtoCart,addtocart)
router.get('/',isAuthenticated,getCart)



export default router;