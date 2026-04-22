import { body, validationResult } from "express-validator";


const validateRequest = (req, res, next,) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }
    next();
}
const allowedCategories = ["MEN", "WOMEN", "KID", "UNISEX"];
export const ProductValidate = [
    body("title").notEmpty().withMessage("Title is required"),
    // body("description").notEmpty().withMessage("Description is required"),
     body("category")
    .optional()
    .customSanitizer((value) => value?.toUpperCase())
    .isIn(allowedCategories)
    .withMessage("Invalid category"),
    body("priceAmount").isNumeric().withMessage("Price amount must be a number"),
    body("priceCurrency").notEmpty().withMessage("Price currency is required"),
    validateRequest
]