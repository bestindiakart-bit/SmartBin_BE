import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    customerType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    transitDays: {
      type: Number,
      required: true,
      min: 0,
    },

    gstNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    adminPassword: {
      type: String,
      required: true,
    },

    shippingAddress1: {
      type: String,
      required: true,
    },

    shippingAddress2: {
      type: String,
      required: true,
    },

    billingAddress: {
      type: String,
      required: true,
    },

    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
  },
  { timestamps: true },
);

// Geo index
customerSchema.index({ geoLocation: "2dsphere" });

// Compound performance index
customerSchema.index({ status: 1, companyName: 1 });

export const Customer = mongoose.model("Customer", customerSchema);
