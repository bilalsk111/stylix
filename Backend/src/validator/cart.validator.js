import {param,body,validationResult} from "express-validator";

const  validateResponse = async(req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}
export const validateAddtoCart = [
    param("productId").isMongoId().withMessage("Invalid product Id"),
    param("variant").optional().isMongoId().withMessage("Invalid variant Id"),
    body("quantity").optional().isInt({min:1}).withMessage("Quantity must be at 1"),
    validateResponse
]
export const validateUpdateCartQty = [
     param("productId").isMongoId().withMessage("Invalid product ID"),
    param("variantId").optional().isMongoId().withMessage("Invalid variant ID"),
    validateResponse
]