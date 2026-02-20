import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const projectStatus = {
  pending: 1,
  inProgress: 2,
  completed: 3,
};

const projectSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    projectId: {
      type: String,
      required: true,
      trim: true,
    },

    projectHead: {
      type: String,
      required: true,
      trim: true,
    },

    projectManager: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    projectDescription: {
      type: String,
      trim: true,
    },

    projectStatus: {
      type: Number,
      enum: Object.values(projectStatus),
      default: projectStatus.pending,
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
  {
    timestamps: true,
  },
);
// Prevent duplicate project names per customer
projectSchema.index(
  { customerId: 1, projectName: 1, status: 1, projectStatus: 1 },
  { unique: true },
);

// Faster filtering

export const Project = mongoose.model("Project", projectSchema, "projects");
