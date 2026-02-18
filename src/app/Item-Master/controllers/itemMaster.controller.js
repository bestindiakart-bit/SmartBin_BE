import { ItemMasterService } from "../services/itemMaster.service.js";
import { ResponseHandler } from "../../../utils/response_handler.js";
import { getStoragePath } from "../../../utils/getStoragePath.js";

export class ItemMasterController extends ResponseHandler {
  constructor() {
    super();
    this.service = new ItemMasterService();
  }

  create = async (req, res, next) => {
    try {
      const itemImages = req.files?.length
        ? await Promise.all(req.files.map((file) => getStoragePath(file)))
        : [];

      const payload = {
        ...req.body,
        itemImages,
      };

      const data = await this.service.create(payload, req.user);

      return res.status(data.statusCode).json(data);
    } catch (error) {
      return next(error);
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
      // Process uploaded images
      const itemImages = req.files?.length
        ? await Promise.all(req.files.map(getStoragePath))
        : undefined; // undefined means no image update

      const payload = {
        ...req.body,
      };

      // Only attach images if uploaded
      if (itemImages) {
        payload.itemImages = itemImages;
      }

      const data = await this.service.update(req.params.id, payload, req.user);

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

  deleteImages = async (req, res, next) => {
    try {
      const data = await this.service.deleteImages(
        req.params.id,
        req.body.images,
        req.user,
      );

      return res.status(data.statusCode).json(data);
    } catch (err) {
      return next(err);
    }
  };
}
