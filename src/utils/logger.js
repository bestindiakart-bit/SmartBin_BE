import { logger } from "../config/logger.js";

export class Logger {
  /**
   * Log the given message with given level
   * @param level string
   * @param message any
   * @param context string
   */
  static log(level, message, context = "APPLICATION") {
    logger.log(level, message, { context: context });
  }

  /**
   * Log the given message in the info level
   * @param message any
   * @param context string
   */
  static info(message, context = "APPLICATION") {
    logger.info(message, { context: context });
  }

  /**
   * Log the given message in the error level
   * @param message any
   * @param context string
   */
  static error(message, context = "EXCEPTION") {
    logger.error(message, { context: context });
  }

  /**
   * Log the given message in the warn level
   * @param message any
   * @param context string
   */
  static warn(message, context = "APPLICATION") {
    logger.warn(message, { context: context });
  }
}
