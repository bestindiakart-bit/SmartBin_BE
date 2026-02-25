import mongoose from "mongoose";

const { Schema } = mongoose;

const BinMainDashboardSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    projectName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    masterId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    binId: {
      type: String,
      required: true,
      trim: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    // ================= BIN =================
    binStatus: {
      type: String,
      enum: ["GREEN", "YELLOW", "RED", "DANGER"],
      required: true,
      index: true,
    },

    binCurrentQty: {
      type: Number,
      required: true,
      min: 0,
    },

    binSafetyLimit: {
      type: Number,
      required: true,
      min: 0,
    },

    binReorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },

    binMaxLimit: {
      type: Number,
      required: true,
      min: 0,
    },

    binStatusUpdatedOn: {
      type: Date,
      default: Date.now,
    },

    // ================= WAREHOUSE =================
    whStatus: {
      type: String,
      enum: ["GREEN", "YELLOW", "RED", "DANGER"],
      required: true,
      index: true,
    },

    whSafetyLimit: {
      type: Number,
      required: true,
      min: 0,
    },

    whReorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },

    whMaxLimit: {
      type: Number,
      required: true,
      min: 0,
    },

    whStatusUpdatedOn: {
      type: Date,
      default: Date.now,
    },

    // ================= OVERALL =================
    currentStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * One document per bin
 */
BinMainDashboardSchema.index(
  { customerId: 1, projectName: 1, masterId: 1, binId: 1 },
  { unique: true },
);

export default mongoose.model("BinMainDashboard", BinMainDashboardSchema);
