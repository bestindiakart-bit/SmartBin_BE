import { userTypeService } from "../services/userType.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class UserTypeController extends ResponseHandler {
  service;

  constructor() {
    super();
    this.service = new userTypeService();
  }

  /* ---------------- CREATE ROLE ---------------- */
  create = async (req, res, next) => {
    try {
      const data = await this.service.create(req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  /* ---------------- GET ROLE(S) ---------------- */
  get = async (req, res, next) => {
    try {
      const data = await this.service.get(req.params.id);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  /* ---------------- UPDATE ROLE ---------------- */
  update = async (req, res, next) => {
    try {
      const data = await this.service.update(req.params.id, req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  /* ---------------- DELETE ROLE (Soft) ---------------- */
  delete = async (req, res, next) => {
    try {
      const data = await this.service.delete(req.params.id, req.user);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };
}
