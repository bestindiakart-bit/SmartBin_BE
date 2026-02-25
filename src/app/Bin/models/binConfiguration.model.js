import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const binMasterSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    projectName: {
      type: String,
      required: true,
    },

    masterId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    binId: {
      type: String,
      required: true,
      trim: true,
    },

    supplierItemName: {
      type: String,
      trim: true,
    },

    customerItemName: {
      type: String,
      required: true,
    },

    binMaxQuantity: {
      type: Number,
      required: true,
    },

    binMaxWeight: {
      type: Number,
    },

    safetyStockQuantity: {
      type: Number,
      required: true,
    },

    rol: {
      type: Number,
      required: true,
    },

    itemPerPrice: {
      type: Number,
      required: true,
    },

    weightPerPrice: {
      type: Number,
    },

    itemMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemMaster",
      required: true,
      index: true,
    },

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    isWarehouseCreated: {
      type: Boolean,
      default: false,
    },

    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true },
);

/* Compound Unique Index */
binMasterSchema.index(
  { customerId: 1, projectId: 1, binId: 1 },
  { unique: true },
);

export const BinMaster = mongoose.model("BinMaster", binMasterSchema);
