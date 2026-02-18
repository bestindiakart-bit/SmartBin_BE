import { UserMasterService } from "../services/userMaster.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class UserMasterController extends ResponseHandler {
  service;

  constructor() {
    super();
    this.service = new UserMasterService();
  }

  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const data = await this.service.get(req.params.id, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const data = await this.service.delete(req.params.id, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const data = await this.service.login(req.body);

      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };
}
