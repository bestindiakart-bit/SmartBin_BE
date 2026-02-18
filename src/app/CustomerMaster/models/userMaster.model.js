import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    loginEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    loginPassword: {
      type: String,
      required: true,
    },

    userTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserType",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    companyName: {
      type: String,
      required: true,
      index: true,
    },

    position: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    refreshToken: {
      type: String,
    },

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    createdBy: {
      type: String,
      trim: true,
    },

    updatedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Compound Index for Multi-tenant filtering
userSchema.index({ customerId: 1, status: 1 });

export const User = mongoose.model("User", userSchema);
