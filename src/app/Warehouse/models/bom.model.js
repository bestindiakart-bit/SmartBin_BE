import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const bomItemSchema = new mongoose.Schema(
  {
    _id: false,

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemMaster",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const bomSchema = new mongoose.Schema(
  {
    bomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    bomName: {
      type: String,
      required: true,
      trim: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // ✅ Updated: projectId instead of projectName
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    items: [bomItemSchema],

    overallQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    recordStatus: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },

    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true }
);

bomSchema.index({ customerId: 1, projectId: 1 });

export const Bom = mongoose.model("Bom", bomSchema, "boms");