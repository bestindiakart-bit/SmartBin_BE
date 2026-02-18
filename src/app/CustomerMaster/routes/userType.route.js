import { Router } from "express";
import { UserTypeController } from "../controller/userType.controller.js";
import { authenticate } from "../../../config/passport.js";

export const userTypeRouter = Router();
const userTypeController = new UserTypeController();

/*
|--------------------------------------------------------------------------
| Role Management
|--------------------------------------------------------------------------
| Base: /api/v1/roles
|--------------------------------------------------------------------------
*/

userTypeRouter.use(authenticate(["MASTER_ADMIN"]));

userTypeRouter
  .route("/")
  .post(userTypeController.create)
  .get(userTypeController.get);

userTypeRouter
  .route("/:id")
  .get(userTypeController.get)
  .put(userTypeController.update)
  .delete(userTypeController.delete);

/* Future scalable endpoint */
// userTypeRouter.patch("/:id/permissions", userTypeController.updatePermissions);

export default userTypeRouter;
