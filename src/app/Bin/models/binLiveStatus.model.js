import mongoose from "mongoose";

const binLiveStatusSchema = new mongoose.Schema(
  {
    masterId: { type: String, required: true, index: true },
    binId: { type: String, required: true, index: true },

    // 🔹 IoT Master Status (Online / Offline / Error etc.)
    masterStatus: {
      type: String,
      default: null,
      trim: true,
    },

    // 🔹 IoT Bin Physical Status
    binStatus: {
      type: String,
      default: null,
      trim: true,
    },

    currentQuantity: { type: Number, required: true },
    currentWeight: { type: Number, required: true },
    currentStatus: { type: String, required: true },

    lastUpdatedAt: { type: Date, required: true },

    statusTag: {
      type: String,
      enum: ["green", "blue", "yellow", "orange", "red", "danger"],
      required: true,
    },
    statusMessage: {
      type: String,
      default: null,
    },

    warehouseCurrentStock: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

binLiveStatusSchema.index({ masterId: 1, binId: 1 }, { unique: true });

export const BinLiveStatus = mongoose.model(
  "BinLiveStatus",
  binLiveStatusSchema,
);
