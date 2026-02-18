import express from "express";
import { config } from "dotenv";
import { Logger } from "./utils/logger.js";
import { init } from "./app/app.js";
import { connectToDatabase } from "./config/database.js";
import http from "http";

const env = config();
const app = express();
connectToDatabase();

init(app);

if (env.error) {
  Logger.error(".env file not found", "SERVER");
  process.exit(1);
}

const port = process.env.PORT || 3200;
app.listen(port, "0.0.0.0", () => {
  Logger.info(`Application is running on port ${port}`, "SERVER");
});
