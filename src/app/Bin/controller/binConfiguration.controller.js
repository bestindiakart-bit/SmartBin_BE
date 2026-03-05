import { BinMasterService } from "../services/binConfiguration.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class BinMasterController extends ResponseHandler {
  constructor() {
    super();
    this.service = new BinMasterService();
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
      const result = await this.service.getAll(req.query, req.user);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const result = await this.service.getById(req.params.id, req.user);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
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

  getItemsByCustomerAndProject = async (req, res, next) => {
    try {
      const data = await this.service.getItemsByCustomerAndProject(
        req.query,
        req.user,
      );
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  // delete = async (req, res, next) => {
  //   try {
  //     const data = await this.service.delete(req.params.id, req.user);
  //     return res.status(data.statusCode).json(data);
  //   } catch (err) {
  //     return next(err);
  //   }
  // };
}
