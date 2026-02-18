import { Router } from "express";
import { ItemCategoryController } from "../controllers/itemCategory.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

export const itemCategoryRouter = Router();
const tempCategoryController = new ItemCategoryController();

itemCategoryRouter
  .route("/")
  .post(
    authenticate(),
    authorize("item_master", "create"),
    tempCategoryController.create,
  )
  .get(
    authenticate(),
    authorize("item_master", "view"),
    tempCategoryController.getAll,
  );

itemCategoryRouter
  .route("/:id")
  .put(
    authenticate(),
    authorize("item_master", "edit"),
    tempCategoryController.update,
  )
  .delete(
    authenticate(),
    authorize("item_master", "delete"),
    tempCategoryController.delete,
  );
