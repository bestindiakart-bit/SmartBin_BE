import { ProjectMasterService } from "../services/projectMaster.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class ProjectMasterController extends ResponseHandler {
  service = null;
  constructor() {
    super();
    this.service = new ProjectMasterService();
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
      const data = await this.service.get(req.query, req.user);
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

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getById(req.params.id, req.user);

      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };
}
