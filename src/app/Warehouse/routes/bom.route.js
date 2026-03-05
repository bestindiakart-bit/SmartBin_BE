import express from "express";
import { BomController } from "../controllers/bom.controller.js";
import { authenticate } from "../../../config/passport.js";
import { authorize } from "../../../middleware/permission.middleware.js";

const bomRouter = express.Router();

const bomController = new BomController();

// ===============================
// 🔹 Create BOM
// ===============================
bomRouter.post(
  "/",
  authenticate(),
  authorize("bill_of_materials", "create"),
  bomController.createBom
);

// ===============================
// 🔹 Get All BOM
// ===============================
bomRouter.get(
  "/",
  authenticate(),
  authorize("bill_of_materials", "view"),
  bomController.getAllBoms
);

// ===============================
// 🔹 Get Single BOM
// ===============================
bomRouter.get(
  "/:id",
  authenticate(),
  authorize("bill_of_materials", "view"),
  bomController.getBomById
);

// ===============================
// 🔹 Update BOM
// ===============================
bomRouter.put(
  "/:id",
  authenticate(),
  authorize("bill_of_materials", "edit"),
  bomController.updateBom
);

// ===============================
// 🔹 Delete BOM (Soft Delete)
// ===============================
bomRouter.delete(
  "/:id",
  authenticate(),
  authorize("bill_of_materials", "delete"),
  bomController.deleteBom
);

bomRouter.get(
  "/items",
  authenticate(),
  authorize("bill_of_materials", "view"),
  bomController.getItemsByCustomerAndProject
);

export default bomRouter;