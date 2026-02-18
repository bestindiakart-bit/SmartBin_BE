import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const warehouseSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    warehouseId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    warehouseName: {
      type: String,
      required: true,
      trim: true,
    },

    warehouseLocation: {
      type: String,
      trim: true,
    },

    warehouseMaxLimit: {
      type: Number,
      required: true,
      min: 0,
    },

    safetyStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderRequired: {
      type: Number,
      default: 0,
      min: 0,
    },

    supplierName: {
      type: String,
      trim: true,
    },

    lastTransactionQuantity: {
      type: Number,
      default: 0,
    },

    lastTransactionDate: {
      type: Date,
    },

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true },
);

// Prevent duplicate warehouse name per customer
warehouseSchema.index(
  { customerId: 1, warehouseName: 1, warehouseId: 1 },
  { unique: true },
);

export const Warehouse = mongoose.model(
  "Warehouse",
  warehouseSchema,
  "warehouse_master",
);
