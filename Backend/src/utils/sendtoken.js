import { generateAccessToken, generateRefreshToken } from "./token.js";
import { redis } from "../config/redis.js";

export const sendTokens = async (user, res, message, statusCode = 200) => {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await redis.set(
      `refresh:${user._id}`,
      refreshToken,
      "EX",
      7 * 24 * 60 * 60
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(statusCode).json({
      success: true,
      message,
      user: {
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("sendTokens error:", err);
    return res.status(500).json({ message: "Token error" });
  }
};