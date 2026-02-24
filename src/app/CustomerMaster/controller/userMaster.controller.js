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
    console.log(req.params.id);
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

  verifyOtp = async (req, res, next) => {
    try {
      const data = await this.service.verifyOtp(req.body);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
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

  resendOtp = async (req, res, next) => {
    try {
      const data = await this.service.resendOtp(req.body);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const data = await this.service.changePassword(req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const data = await this.service.forgotPassword(req.body);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const data = await this.service.resetPassword(req.body);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
}
