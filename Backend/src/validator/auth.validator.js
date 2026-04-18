import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

export const validateRegisterUser = [
    body("fullname")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Full name must be 3–50 characters")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Name must contain only letters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("contact")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .matches(/^\+?[1-9]\d{7,14}$/)
        .withMessage("Invalid phone number (e.g. +919876543210)"),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Must contain at least one lowercase letter")
        .matches(/[0-9]/).withMessage("Must contain at least one number")
        .matches(/[\W_]/).withMessage("Must contain at least one special character"),

    body("isSeller")
        .optional()
        .isBoolean().withMessage("isSeller must be a boolean value"),

    validateRequest,
];

export const validateLoginUser = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required"),

    validateRequest,
];