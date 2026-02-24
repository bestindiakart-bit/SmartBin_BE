import { Router } from "express";
import { CustomerMasterController } from "../controller/customerMaster.controller.js";
import { authenticate } from "../../../config/passport.js";

export const customerMasterRouter = Router();
const customerMasterController = new CustomerMasterController();

/**
 * Login
 * Public route
 */
customerMasterRouter.post("/login", customerMasterController.login);

// /**
//  * Refresh access token
//  * Requires refresh token
//  */
// customerMasterRouter.post(
//   "/refresh",
//   authenticate([], "refreshToken"),
//   customerMasterController.refresh,
// );

/**
 * Get current logged user profile (optional)
 */
customerMasterRouter.get(
  "/me",
  authenticate(["MASTER_ADMIN", "ADMIN"]),
  customerMasterController.getProfile,
);

customerMasterRouter.use(authenticate(["MASTER_ADMIN", "ADMIN"]));

customerMasterRouter
  .route("/")
  .post(customerMasterController.create)
  .get(customerMasterController.get);

customerMasterRouter
  .route("/:id")
  .get(customerMasterController.get)
  .put(customerMasterController.update)
  .delete(customerMasterController.delete);
