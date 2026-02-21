import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const customerTypeSchema = new mongoose.Schema(
  {
    customerTypeName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
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

// Index for fast search
customerTypeSchema.index({ customerTypeName: 1 });

export const CustomerType = mongoose.model("CustomerType", customerTypeSchema);
