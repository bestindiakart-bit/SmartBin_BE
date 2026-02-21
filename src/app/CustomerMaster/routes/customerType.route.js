import { Router } from "express";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";
import { CustomerTypeController } from "../controller/customerType.controller.js";

export const customerTypeRouter = Router();
const controller = new CustomerTypeController();

customerTypeRouter
  .route("/")
  .post(
    authenticate(),
    authorize("customer_master", "create"),
    controller.create,
  )
  .get(authenticate(), authorize("customer_master", "view"), controller.get);

customerTypeRouter
  .route("/:id")
  .put(authenticate(), authorize("customer_master", "edit"), controller.update)
  .delete(
    authenticate(),
    authorize("customer_master", "delete"),
    controller.delete,
  );
