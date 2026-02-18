import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    entityType: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    actionType: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema,
  "activity_logs",
);
