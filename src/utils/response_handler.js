import { StatusCodes } from "http-status-codes";
import { Logger } from "../utils/logger.js";

export class ResponseHandler {
  /**
   * Returns the success, error and exception response
   * @param res Response
   * @param data AppResponse
   */
  handle(res, data) {
    if (data.success) {
      return this.successResponse(res, data, data.statusCode);
    } else if (data.exception) {
      return this.exceptionResponse(res, data, data.statusCode);
    } else {
      return this.errorResponse(res, data, data.statusCode);
    }
  }

  /**
   * Sends the success response to the user
   * @param res Response
   * @param data AppResponse
   * @param statusCode number
   */
  successResponse(res, data, statusCode = StatusCodes.OK) {
    let response = {
      data: data.data,
    };
    if (data.meta) {
      response.meta = data.meta;
    }
    return res.status(statusCode).json(response);
  }

  /**
   * Sends the error response to the user
   * @param res Response
   * @param data AppResponse
   * @param statusCode number
   */
  errorResponse(res, data, statusCode = StatusCodes.BAD_REQUEST) {
    return res.status(statusCode).json({ errors: data.errors });
  }

  /**
   * Sends the exception response to the user
   * @param res Response
   * @param data AppResponse
   * @param statusCode number
   */
  exceptionResponse(res, data, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    Logger.error(data.exception, "EXCEPTION");
    return res.status(statusCode).json({ errors: String(data.errors) });
  }
}
