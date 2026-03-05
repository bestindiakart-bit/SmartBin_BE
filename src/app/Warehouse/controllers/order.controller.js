import { OrderService } from "../services/order.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class OrderController extends ResponseHandler {
  service;
  constructor() {
    super();
    this.service = new OrderService();
  }

  // controllers/order.controller.js

  getAllOrders = async (req, res, next) => {
    try {
      const data = await this.service.getAllOrders(req.query, req.user);

      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
}
