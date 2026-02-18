import { WarehouseService } from "../services/warehouse.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class WarehouseController extends ResponseHandler {
  service = null;
  constructor() {
    super();
    this.service = new WarehouseService();
  }

  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const data = await this.service.getAll(req.query, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  getCustomerWarehouses = async (req, res, next) => {
    console.log(req.query);
    try {
      const data = await this.service.getCustomerWarehouses(
        req.query,
        req.user,
      );
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
}
