import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Bin Sub Schema
 */
const BinSchema = new Schema(
  {
    binId: {
      type: String,
      required: true,
      trim: true,
    },
    binStatus: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      required: true,
    },
    binWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    pieceRemaining: {
      type: Number,
      required: true,
      min: 0,
    },
    safetyStock: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const BinStatusLogSchema = new Schema(
  {
    masterId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    masterStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      required: true,
    },
    bins: {
      type: [BinSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one bin is required",
      },
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export default mongoose.model("BinStatusLog", BinStatusLogSchema);
