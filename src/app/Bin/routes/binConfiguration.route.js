import { Router } from "express";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";
import { BinMasterController } from "../controller/binConfiguration.controller.js";

export const binMasterRouter = Router();
const binMasterController = new BinMasterController();

binMasterRouter
  .route("/")
  .post(
    authenticate(),
    authorize("bin_configuration", "create"),
    binMasterController.create,
  )
  .get(
    authenticate(),
    authorize("bin_configuration", "view"),
    binMasterController.getAll,
  );

binMasterRouter
  .route("/:id")
  .get(
    authenticate(),
    authorize("bin_configuration", "view"),
    binMasterController.getById,
  );

  

binMasterRouter
  .route("/:id")
  .put(
    authenticate(),
    authorize("bin_configuration", "edit"),
    binMasterController.update,
  );

  binMasterRouter.get(
  "/items/by-project",
  authenticate(),
  authorize("bill_of_materials", "view"),
  binMasterController.getItemsByCustomerAndProject
);
