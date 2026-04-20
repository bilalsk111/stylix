import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
   console.log("👉 Cookies:", req.cookies);
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "NO_TOKEN" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "USER_NOT_FOUND" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "INVALID_TOKEN" });
  }
};

export const authenticateSeller = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken; 

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "seller") {
      return res.status(403).json({ message: "Forbidden (Seller only)" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireSeller = (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Seller access only" });
  }
  next();
};