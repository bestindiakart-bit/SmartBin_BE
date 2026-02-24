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
  .get(
    authenticate(),
    authorize("user_master", "view"),
    userMasterController.get,
  )
  .delete(
    authenticate(),
    authorize("user_master", "delete"),
    userMasterController.delete,
  );

userMasterRouter.route("/login").post(userMasterController.login);

userMasterRouter.post("/verify-otp", userMasterController.verifyOtp);

userMasterRouter.get("/me", authenticate(), userMasterController.getProfile);

userMasterRouter.post("/resend-otp", userMasterController.resendOtp);

userMasterRouter.post(
  "/change-password",
  authenticate(),
  userMasterController.changePassword,
);

userMasterRouter.post("/forgot-password", userMasterController.forgotPassword);

userMasterRouter.post("/reset-password", userMasterController.resetPassword);

export default userMasterRouter;
