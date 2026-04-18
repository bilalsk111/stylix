import { redis } from "../config/redis.js";

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await redis.del(`refresh:${userId}`);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};