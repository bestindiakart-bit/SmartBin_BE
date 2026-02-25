import { createClient } from "redis";
import { Logger } from "../utils/logger.js";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  Logger.info("Connecting to Redis...", "REDIS");
});

redisClient.on("ready", () => {
  Logger.info("Redis Connected Successfully", "REDIS");
});

redisClient.on("error", (err) => {
  Logger.error(`Redis Error: ${err.message}`, "REDIS");
});

redisClient.on("end", () => {
  Logger.warn("Redis connection closed", "REDIS");
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    Logger.error(`Redis Connection Failed: ${error.message}`, "REDIS");
    process.exit(1);
  }
};

export { redisClient, connectRedis };