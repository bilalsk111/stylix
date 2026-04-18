import Redis from "ioredis";
import { config } from "./config.js";

export const redis = new Redis({
  host: config.REDIS.host,
  port: config.REDIS.port,
  password: config.REDIS.password,

  // ✅ important for cloud Redis (Upstash, Redis Cloud)
  tls: config.REDIS.tls ? {} : undefined,

  // ✅ keep connection alive
  keepAlive: 10000,

  // ✅ auto reconnect strategy
  retryStrategy(times) {
    if (times > 10) {
      console.error("Redis: too many retries");
      return null; // stop retrying
    }
    return Math.min(times * 100, 3000);
  },

  // ✅ handle connection drops
  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    if (targetErrors.some(e => err.message.includes(e))) {
      return true;
    }
    return false;
  },

  maxRetriesPerRequest: 3, // prevent hanging requests
});


// ✅ event logs (good for debugging)
redis.on("connect", () => console.log("✅ Redis connected"));

redis.on("ready", () => console.log("🚀 Redis ready"));

redis.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));

redis.on("end", () => console.log("❌ Redis connection closed"));

redis.on("error", (err) => console.error("🔥 Redis error:", err));