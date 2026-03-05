import express from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

const orderRouter = express.Router();

const orderController = new OrderController();

// routes/order.routes.js

orderRouter.get(
  "/",
  authenticate(),
  authorize("warehouse_order_details", "view"),
  orderController.getAllOrders,
);

export default orderRouter;
