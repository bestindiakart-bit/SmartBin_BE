import { Router } from "express";
import { ItemMasterController } from "../controllers/itemMaster.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";
import upload from "../../../middleware/multer.js";

export const itemMasterRouter = Router();
const itemMasterController = new ItemMasterController();

itemMasterRouter
  .route("/")
  .post(
    authenticate(),
    authorize("item_master", "create"),
    upload.fields([
      { name: "itemImages", maxCount: 10 },
      { name: "itemDrawing", maxCount: 1 },
    ]),
    itemMasterController.create,
  )

  .get(
    authenticate(),
    authorize("item_master", "view"),
    itemMasterController.getAll,
  );

itemMasterRouter
  .route("/:id")
  .get(
    authenticate(),
    authorize("item_master", "view"),
    itemMasterController.getById,
  )
  .put(
    authenticate(),
    authorize("item_master", "edit"),
    upload.fields([
      { name: "itemImages", maxCount: 10 },
      { name: "itemDrawing", maxCount: 1 },
    ]),
    itemMasterController.update,
  )
  .delete(
    authenticate(),
    authorize("item_master", "delete"),
    itemMasterController.delete,
  );

itemMasterRouter.delete(
  "/:id/images",
  authenticate(),
  authorize("item_master", "delete"),
  itemMasterController.deleteImages,
);
