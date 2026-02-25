import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true },
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false },
);

const userTypeSchema = new mongoose.Schema(
  {
    userTypeName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    permissions: [permissionSchema],

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },

    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true },
);

userTypeSchema.index({ userTypeName: 1 }, { unique: true });

export const UserType = mongoose.model("UserType", userTypeSchema);
