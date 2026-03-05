import mongoose from "mongoose";

const warehouseTransactionSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },

    itemMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemMaster",
      required: true,
      index: true,
    },

    transactionType: {
      type: String,
      enum: [
        "RELOAD_TO_BIN",     // Warehouse → Bin
        "PURCHASE",          // Vendor → Warehouse
        "MANUAL_ADJUSTMENT", // Admin change
        "RETURN",            // Bin → Warehouse
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    referenceId: {
      type: String, // Optional: binId or purchaseId
    },

    transactionDate: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: String,
      default: "SYSTEM",
    },
  },
  { timestamps: true }
);

// Fast reporting index
warehouseTransactionSchema.index({
  warehouseId: 1,
  itemMasterId: 1,
  transactionDate: -1,
});

export const WarehouseTransaction = mongoose.model(
  "WarehouseTransaction",
  warehouseTransactionSchema
);