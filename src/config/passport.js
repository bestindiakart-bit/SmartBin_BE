import passport from "passport";
import { StatusCodes } from "http-status-codes";

/**
 * Authentication & Authorization Middleware
 * @param {Array} roles - Allowed roles
 * @param {String} tokenType - "accessToken" | "refreshToken"
 */
export function authenticate(roles = [], tokenType = "accessToken") {  
  return (req, res, next) => {
    passport.authenticate(
      "jwt",
      { session: false },
      (err, decodedToken, info) => {
        //  Passport error
        if (err) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: err.message || "Unauthorized request",
          });
        }

        // No token / invalid token
        if (!decodedToken) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: info?.message || "Invalid or expired token",
          });
        }

        // Token type validation
        if (decodedToken.type !== tokenType) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message:
              tokenType === "refreshToken"
                ? "Only refresh token allowed"
                : "Only access token allowed",
          });
        }

        // Role validation
        if (roles.length && !roles.includes(decodedToken.data.role)) {
          return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: "Insufficient permissions",
          });
        }

        // Attach to request
        req.decodedToken = decodedToken;
        req.user = decodedToken.data;

        next();
      },
    )(req, res, next);
  };
}
