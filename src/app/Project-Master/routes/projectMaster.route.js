import { Router } from "express";
import { ProjectMasterController } from "../controller/projectMaster.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

export const projectMasterRouter = Router();
const projectMasterController = new ProjectMasterController();

projectMasterRouter
  .route("/")
  .post(
    authenticate(),
    authorize("project_master", "create"),
    projectMasterController.create,
  )
  .get(
    authenticate(),
    authorize("project_master", "view"),
    projectMasterController.get,
  );

projectMasterRouter
  .route("/:id")
  .get(
    authenticate(),
    authorize("project_master", "view"),
    projectMasterController.get,
  )
  .put(
    authenticate(),
    authorize("project_master", "edit"),
    projectMasterController.update,
  )
  .delete(
    authenticate(),
    authorize("project_master", "delete"),
    projectMasterController.delete,
  );
