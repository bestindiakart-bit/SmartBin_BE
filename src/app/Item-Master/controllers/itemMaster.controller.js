import { ItemMasterService } from "../services/itemMaster.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class ItemMasterController extends ResponseHandler {
  constructor() {
    super();
    this.service = new ItemMasterService();
  }

  create = async (req, res, next) => {
    console.log(req.body);
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

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getById(req.params.id, req.user);
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

  delete = async (req, res, next) => {
    try {
      const data = await this.service.delete(req.params.id, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
}
