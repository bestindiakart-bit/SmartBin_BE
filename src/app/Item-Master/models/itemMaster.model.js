import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const itemMasterSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    itemId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    partNumber: {
      type: String,
      trim: true,
    },

    itemDescription: {
      type: String,
      trim: true,
    },

    weightPerUnit: {
      type: Number,
    },

    costPerUnit: {
      type: Number,
    },

    remarks: {
      type: String,
      trim: true,
    },

    manufacturingTime: {
      type: Number, // in minutes or hours
    },

    itemCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemCategory",
    },

    itemSBQ: {
      type: Number,
    },

    price: {
      type: Number,
    },

    itemHSNCode: {
      type: String,
      trim: true,
    },

    warehouseStock: {
      type: Number,
      default: 0,
    },

    warehouseSafetyStock: {
      type: Number,
      default: 0,
    },

    warehouseStockUrl: {
      type: String,
      trim: true,
    },

    isLocal: {
      type: Boolean,
      default: false,
    },

    itemImages: {
      type: [String],
      trim: true,
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

itemMasterSchema.index({ customerId: 1, itemName: 1 }, { unique: true });

export const ItemMaster = mongoose.model(
  "ItemMaster",
  itemMasterSchema,
  "item_master",
);
