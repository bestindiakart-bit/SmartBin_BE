import { CustomerMasterService } from "../services/customerMaster.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class CustomerMasterController extends ResponseHandler {
  service;

  constructor() {
    super();
    this.service = new CustomerMasterService();
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
      const data = await this.service.get(req.params.id);
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

  getProfile = async (req, res, next) => {
    try {
      // id comes from JWT middleware
      const userId = req.user._id;

      const data = await this.service.getProfile(userId);

      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  createCustomer = async (req, res, next) => {
    try {
      const data = await this.service.createCustomer(req.body, req.user?._id);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  getCustomers = async (req, res, next) => {
    try {
      const data = await this.service.getCustomers(req.query.id);
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };

  updateCustomer = async (req, res, next) => {
    try {
      const data = await this.service.updateCustomer(
        req.params.id,
        req.body,
        req.user?._id,
      );
      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
    }
  };
}
