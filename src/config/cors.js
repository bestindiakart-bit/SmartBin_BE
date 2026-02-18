import { config } from "dotenv";

config();

const CORS_WHITE_LIST = process.env.CORS_WHITE_LIST
  ? process.env.CORS_WHITE_LIST.split(",")
  : undefined;
export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    // Allow all origins (not recommended for production)
    if (!CORS_WHITE_LIST) {
      return callback(null, true);
    }

    if (!CORS_WHITE_LIST || CORS_WHITE_LIST.indexOf(origin) === -1) {
      const errorMessage = `Access denied: Origin ${origin} is not allowed. Only the following origins are permitted: ${
        CORS_WHITE_LIST?.join(", ") || "none"
      }.`;
      return callback(new Error(errorMessage), false);
    }
    return callback(null, true);
  },
  credentials: true,
};
