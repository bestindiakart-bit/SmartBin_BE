import { BomService } from "../services/bom.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";

export class BomController extends ResponseHandler {
  service;

  constructor() {
    super();
    this.service = new BomService();
  }

  // ===============================
  // 🔹 Create BOM
  // ===============================
  createBom = async (req, res, next) => {
    try {
      const data = await this.service.createBom(req.body, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  // ===============================
  // 🔹 Get All BOM
  // ===============================
  getAllBoms = async (req, res, next) => {
    try {
      const data = await this.service.getAllBoms(req.query, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  // ===============================
  // 🔹 Get Single BOM
  // ===============================
  getBomById = async (req, res, next) => {
    try {
      const data = await this.service.getBomById(req.params.id, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  // ===============================
  // 🔹 Update BOM
  // ===============================
  updateBom = async (req, res, next) => {
    try {
      const data = await this.service.updateBom(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  // ===============================
  // 🔹 Delete BOM (Soft Delete)
  // ===============================
  deleteBom = async (req, res, next) => {
    try {
      const data = await this.service.deleteBom(req.params.id, req.user);
      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };

  getItemsByCustomerAndProject = async (req, res, next) => {
  try {
    const data = await this.service.getItemsByCustomerAndProject(
      req.query,
      req.user
    );
    return res.status(data.statusCode).json(data);
  } catch (err) {
    return next(err);
  }
};
}