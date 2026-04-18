import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { redis } from "../config/redis.js";
import { generateAccessToken } from "../utils/token.js";

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);

    const stored = await redis.get(`refresh:${decoded.id}`);

    if (stored !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({ _id: decoded.id });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(403).json({ message: "Refresh expired" });
  }
};