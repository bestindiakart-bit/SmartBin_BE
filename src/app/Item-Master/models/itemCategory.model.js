import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const itemCategorySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
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

// Unique per customer
itemCategorySchema.index({ customerId: 1, categoryName: 1 }, { unique: true });

itemCategorySchema.index({ customerId: 1, status: 1 });

export const ItemCategory = mongoose.model(
  "ItemCategory",
  itemCategorySchema,
  "item_categories",
);
