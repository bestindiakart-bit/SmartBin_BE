import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const PAYMENT_STATUS = {
  PENDING: 1,
  PAID: 2,
};

const warehouseSchema = new mongoose.Schema({
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

  // NEW: Items inside warehouse
  items: [
    {
      _id: false,
      itemMasterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemMaster",
        required: true,
      },

      warehouseLimit: {
        type: Number,
        required: true,
        min: 0,
      },

      warehouseReorderLevel: {
        type: Number,
        required: true,
        min: 0,
      },

      warehouseSafeStock: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],

  status: {
    type: Number,
    enum: Object.values(STATUS),
    default: STATUS.ACTIVE,
    index: true,
  },

  createdBy: String,
  updatedBy: String,
});

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
