import { Router } from "express";
import { authenticate } from "../../config/passport.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { ExportController } from "./export.controller.js";
import { dynamicAuthorize } from "../../middleware/dynamicAuthorize.js";

const exportRouter = Router();
const exportController = new ExportController();

exportRouter.post(
  "/:module",
  authenticate(),
  dynamicAuthorize,
  exportController.exportData,
);

export { exportRouter };
