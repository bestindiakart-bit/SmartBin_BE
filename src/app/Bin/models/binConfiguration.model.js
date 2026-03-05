import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const binMasterSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
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

    itemMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemMaster",
      required: true,
      index: true,
    },

    customerItemName: {
      type: String,
      required: true,
    },

    binAllowablelimit: {
      type: Number,
      required: true,
    },

    binAllowableWeight: {
      type: Number,
    },

    customerAllowableLimit: {
      type: Number,
    },

    customerAllowableWeight: {
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

    weightPerPiece: {
      type: Number,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
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

/* Compound Unique Index */
binMasterSchema.index(
  { customerId: 1, projectId: 1, binId: 1 },
  { unique: true },
);

export const BinMaster = mongoose.model("BinMaster", binMasterSchema);
