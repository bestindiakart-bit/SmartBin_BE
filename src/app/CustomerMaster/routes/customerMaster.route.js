import { Router } from "express";
import { CustomerMasterController } from "../controller/customerMaster.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

export const customerMasterRouter = Router();
const customerMasterController = new CustomerMasterController();

/**
 * Login
 * Public route
 */
customerMasterRouter.post("/login", customerMasterController.login);

/**
 * Get current logged user profile (optional)
 */
customerMasterRouter.get("/me", customerMasterController.getProfile);

customerMasterRouter
  .route("/")
  .post(
    authenticate(),
    authorize("customer_master", "create"),
    customerMasterController.create,
  )
  .get(
    authenticate(),
    authorize("customer_master", "view"),
    customerMasterController.get,
  );

customerMasterRouter
  .route("/get/all")
  .get(
    authenticate(),
    authorize("customer_master", "view"),
    customerMasterController.getAll,
  );

customerMasterRouter
  .route("/:id")
  .get(
    authenticate(),
    authorize("customer_master", "view"),
    customerMasterController.get,
  )

  .put(
    authenticate(),
    authorize("customer_master", "edit"),
    customerMasterController.update,
  )
  .delete(
    authenticate(),
    authorize("customer_master", "delete"),
    customerMasterController.delete,
  );
