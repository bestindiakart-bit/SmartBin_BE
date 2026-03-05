import mongoose from "mongoose";

const binStatusLogSchema = new mongoose.Schema(
  {
    masterId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    masterStatus: {
      type: String,
      required: true,
    },
    binStatus: {
      type: String,
      required: true,
    },

    binId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // 🔹 Quantity Tracking
    previousQuantity: {
      type: Number,
      default: null,
    },

    currentQuantity: {
      type: Number,
      required: true,
    },

    differenceQuantity: {
      type: Number,
      required: true,
    },

    // 🔹 Weight Tracking
    previousWeight: {
      type: Number,
      default: null,
    },

    currentWeight: {
      type: Number,
      required: true,
    },

    // 🔹 Status Tracking
    previousStatus: {
      type: String,
      enum: ["green", "blue", "yellow", "orange", "red", "danger"],
      default: null,
    },

    currentStatus: {
      type: String,
      enum: ["green", "blue", "yellow", "orange", "red", "danger"],
      required: true,
    },

    // 🔹 Optional message tracking (recommended)
    statusMessage: {
      type: String,
      default: null,
    },

    // 🔹 Log timestamp from IoT
    loggedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index for faster bin history queries
binStatusLogSchema.index({ masterId: 1, binId: 1, loggedAt: -1 });

export const BinStatusLog = mongoose.model("BinStatusLog", binStatusLogSchema);
