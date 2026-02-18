import { Router } from "express";
import { WarehouseController } from "../controllers/warehouse.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

export const wareHouseRouter = Router();
const warehouseController = new WarehouseController();

wareHouseRouter
  .route("/")
  .post(
    authenticate(),
    authorize("warehouse_creation", "create"),
    warehouseController.create,
  )
  .get(
    authenticate(),
    authorize("warehouse_creation", "view"),
    warehouseController.getAll,
  );

wareHouseRouter
  .route("/:id")
  .put(
    authenticate(),
    authorize("warehouse_creation", "edit"),
    warehouseController.update,
  );

wareHouseRouter.get(
  "/customer",
  authenticate(),
  authorize("warehouse_creation", "view"),
  warehouseController.getCustomerWarehouses,
);
