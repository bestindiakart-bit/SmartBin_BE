import { ResponseHandler } from "../../utils/response_handler.js";
import { ExportService } from "./export.service.js";

export class ExportController extends ResponseHandler {
  service;

  constructor() {
    super();
    this.service = new ExportService();
  }

  exportData = async (req, res, next) => {
    try {
      const { module } = req.params;
      const { format, ...filters } = req.query;

      const data = await this.service.generateExport(
        module,
        format,
        filters,
        req.user,
      );

      if (!data.success) {
        return res.status(data.statusCode).json(data);
      }

      res.setHeader("Content-Type", data.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${data.fileName}`,
      );

      return res.status(data.statusCode).send(data.fileBuffer);
    } catch (error) {
      return next(error);
    }
  };
}
