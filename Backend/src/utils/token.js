import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, config.JWT_REFRESH_SECRET, {
    expiresIn: "15m",
  });
};