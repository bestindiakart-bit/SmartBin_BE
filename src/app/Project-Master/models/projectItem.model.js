import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const projectItemSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    itemMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemMaster",
      required: true,
      index: true,
    },

    estimatedQuantity: {
      type: Number,
      default: 0,
    },

    totalConsumed: {
      type: Number,
      default: 0,
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

projectItemSchema.index(
  { customerId: 1, projectId: 1, itemMasterId: 1 },
  { unique: true }
);

export const ProjectItem = mongoose.model(
  "ProjectItem",
  projectItemSchema,
  "project_items"
);