import jwt from "jsonwebtoken";
import {
  JWT_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRES,
  JWT_ALGORITHM,
  JWT_REFRESH_TOKEN_EXPIRES,
} from "../config/jwt.js";

/**
 * Get the jwt token
 * @param data any
 */
export function getJwtToken(data) {
  console.log(data);
  return {
    accessToken: getAccessToken(data),
    refreshToken: getRefreshToken(data),
  };
}

/**
 * Generate the access token and return it
 * @param data any
 */
function getAccessToken(data) {
  const payload = {
    type: "accessToken",
    subject: data._id,
    data: data,
  };
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRES,
    algorithm: JWT_ALGORITHM,
  });
}

/**
 * Generate the refresh token and return it
 * @param data any
 */
function getRefreshToken(data) {
  const payload = {
    type: "refreshToken",
    subject: data._id,
    data: data,
  };
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRES,
    algorithm: JWT_ALGORITHM,
  });
}

export function registerToken(id) {
  const token = jwt.sign(
    { userId: id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15m" }, // valid for 15 minutes
  );
  return token; // don't forget to return it
}
