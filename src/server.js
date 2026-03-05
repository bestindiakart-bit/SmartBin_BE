import express from "express";
import { config } from "dotenv";
import { Logger } from "./utils/logger.js";
import { init } from "./app/app.js";
import { connectToDatabase } from "./config/database.js";
// import { connectRedis } from "./config/redisClient.js";

const env = config();
const app = express();

if (env.error) {
  Logger.error(".env file not found", "SERVER");
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectToDatabase();   // MongoDB
    // await connectRedis();        // Redis

    init(app);

    const port = process.env.PORT || 3200;

    app.listen(port, "0.0.0.0", () => {
      Logger.info(`Application is running on port ${port}`, "SERVER");
    });

  } catch (error) {
    Logger.error(error.message, "SERVER");
    process.exit(1);
  }
};

startServer();