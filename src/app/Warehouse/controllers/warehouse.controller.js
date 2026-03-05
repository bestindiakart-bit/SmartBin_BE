import { WarehouseService } from "../services/warehouse.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class WarehouseController extends ResponseHandler {
  service;
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

  deleteWarehouse = async (req, res, next) => {
    try {
      const result = await this.service.deleteWarehouse(
        req.params.id,
        req.user,
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  };

  warehouseByItem = async (req, res, next) => {
    try {
      const data = await this.service.warehouseByItem(req.query, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
  warehouseTransactionByItem = async (req, res, next) => {
    try {
      const data = await this.service.warehouseTransactionByItem(
        req.query,
        req.user,
      );

      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
}
