// import { createLogger, format, transports } from "winston";

// export const logger = createLogger({
//   level: "info",
//   format: format.combine(
//     format.errors({ stack: true }),
//     format.timestamp(),
//     format.prettyPrint(),
//     format.colorize(),
//     format.json(),
//   ),
//   transports: [
//     new transports.File({
//       filename: "storage/logs/error.log",
//       level: "error",
//       maxFiles: 14,
//       maxsize: 5242880,
//       zippedArchive: true,
//       tailable: true,
//     }),
//     new transports.File({
//       filename: "storage/logs/combined.log",
//       maxFiles: 14,
//       maxsize: 5242880,
//       zippedArchive: true,
//       tailable: true,
//     }),
//   ],
// });

// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new transports.Console({
//       format: format.simple(),
//     }),
//   );
// }


import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} [${level.toUpperCase()}]: ${stack}`
        : `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console(), // ✅ ONLY console transport
  ],
});