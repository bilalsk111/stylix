import { Router } from "express";
import { login, register,googleCallback, getMe } from "../controllers/auth.controller.js";
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js";
import passport from "passport";
import { config } from "../config/config.js";
import {isAuthenticated} from "../middleware/auth.middleware.js"

const router = Router();

router.post("/register", validateRegisterUser, register);
router.post("/login", validateLoginUser, login);
router.get("/google/", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback",
    passport.authenticate("google", { session: false,
         failurRedirect:config.NODE_ENV === "development" ? "http://localhost:5173/login":"/login",
     }),
   
    googleCallback,
)
router.get('/me',isAuthenticated,getMe)

export default router;