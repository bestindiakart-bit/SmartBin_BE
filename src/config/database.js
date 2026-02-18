import mongoose from "mongoose";
import { Logger } from "../../src/utils/logger.js";

export function connectToDatabase() {
  const DATABASE_URI = process.env.DATABASE_URI;

  if (!DATABASE_URI) {
    console.error("DATABASE_URI environment variable not found");
    process.exit(1);
  }

  mongoose
    .connect(DATABASE_URI)
    .then(() => Logger.info(`MongoDB Connected to ${DATABASE_URI}`))
    .catch((error) => console.error("Error connecting to MongoDB:", error));

  mongoose.connection.on("error", (error) => {
    console.error("👎MongoDB connection error:", error);
  });
}

export function getDatabaseConnection() {
  return mongoose.connection;
}
