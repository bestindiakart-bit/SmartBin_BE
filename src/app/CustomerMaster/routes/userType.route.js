import { Router } from "express";
import { UserTypeController } from "../controller/userType.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

export const userTypeRouter = Router();
const userTypeController = new UserTypeController();

/*
|--------------------------------------------------------------------------
| Role Management
|--------------------------------------------------------------------------
| Base: /api/v1/roles
|--------------------------------------------------------------------------
*/

// userTypeRouter.use(authenticate(["MASTER_ADMIN"]));

userTypeRouter
  .route("/")
  .post(
    authenticate(),
    authorize("user_master", "create"),
    userTypeController.create,
  )
  .get(
    authenticate(),
    authorize("user_master", "view"),
    userTypeController.get,
  );

userTypeRouter
  .route("/:id")
  .get(userTypeController.get)
  .put(
    authenticate(),
    authorize("user_master", "edit"),
    userTypeController.update,
  )
  .delete(userTypeController.delete);

/* Future scalable endpoint */
// userTypeRouter.patch("/:id/permissions", userTypeController.updatePermissions);

export default userTypeRouter;
