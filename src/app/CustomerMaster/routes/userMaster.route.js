import { Router } from "express";
import { UserMasterController } from "../controller/userMaster.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

export const userMasterRouter = Router();
const userMasterController = new UserMasterController();

userMasterRouter
  .route("/")
  .post(
    authenticate(),
    authorize("user_master", "create"),
    userMasterController.create,
  )
  .get(
    authenticate(),
    authorize("user_master", "view"),
    userMasterController.get,
  );

userMasterRouter
  .route("/:id")
  .put(
    authenticate(),
    authorize("user_master", "edit"),
    userMasterController.update,
  )
  .delete(
    authenticate(),
    authorize("user_master", "delete"),
    userMasterController.delete,
  );

userMasterRouter.route("/login").post(userMasterController.login);

export default userMasterRouter;
