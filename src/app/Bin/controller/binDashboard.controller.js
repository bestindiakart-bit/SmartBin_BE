import { ResponseHandler } from "../../../utils/response_handler.js";
import { BinDashboardService } from "../services/binDashboard.service.js";

export class BinDashboardController extends ResponseHandler {
  service;
  constructor() {
    super();
    this.service = new BinDashboardService();
  }

  createDashboard = async (req, res, next) => {
    console.log("binDashboardController");
    try {
      const result = await this.service.createDashboard(req.body, req.user);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getDashboard = async (req, res, next) => {
    try {
      const result = await this.service.getDashboard(req.user);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  };

  processIotData = async (req, res, next) => {
    try {
      const result = await this.service.processPayload(req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getAllLiveStatus = async (req, res, next) => {
    try {
      const result = await this.service.getAllLiveStatus(req.query);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
