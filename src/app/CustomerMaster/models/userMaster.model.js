import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const permissionSchema = new mongoose.Schema(
  {
    module: String,
    create: Boolean,
    view: Boolean,
    edit: Boolean,
    delete: Boolean,
  },
  { _id: false },
);

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
    },

    isMainAdmin: {
      type: Boolean,
      default: false,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
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
    permissions: {
      type: [permissionSchema],
      default: [],
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

    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },

    createdBy: {
      type: String,
      trim: true,
    },

    updatedBy: {
      type: String,
      trim: true,
    },

    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    resetOtp: {
      type: String,
    },

    resetOtpExpiry: {
      type: Date,
    },

    resetPassword: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Compound Index for Multi-tenant filtering
userSchema.index({ customerId: 1, status: 1 });

export const User = mongoose.model("User", userSchema);
