import { CustomerTypeService } from "../services/customerType.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class CustomerTypeController extends ResponseHandler {
  constructor() {
    super();
    this.service = new CustomerTypeService();
  }

  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  get = async (req, res, next) => {
    try {
      const data = await this.service.get(req.query.id);
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
