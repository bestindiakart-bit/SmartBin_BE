import express from "express";
import { BinDashboardController } from "../controller/binDashboard.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

const binDashboardRouter = express.Router();

const binDashboardController = new BinDashboardController();

// Create / Update Dashboard
binDashboardRouter.post("/create", binDashboardController.createDashboard);

binDashboardRouter
  .route("/dashboard")
  .get(
    authenticate(),
    authorize("smart_bin_dashboard", "view"),
    binDashboardController.getDashboard,
  );

binDashboardRouter
  .route("/iot/update")
  .post(
    authenticate(),
    authorize("smart_bin_dashboard", "view"),
    binDashboardController.processIotData,
  );

binDashboardRouter
  .route("/iot/live-status")
  .get(
    authenticate(),
    authorize("smart_bin_dashboard", "view"),
    binDashboardController.getAllLiveStatus,
  );

export default binDashboardRouter;
