import mongoose from "mongoose";
import { STATUS } from "../../../constants/status.js";

const ORDER_STATUS = {
  ORDER_PLACES: 1,
  SUPERADMIN_APPROVED: 2,
  SUPERADMIN_REJECTED: 3,
  SHIPPED: 4,
  RECEIVED: 5,
  GRN_COMPLETED: 6,
  DELIVERED: 7,
  CANCELLED: 8,
};

const PAYMENT_STATUS = {
  PENDING: 1,
  PAID: 2,
  FAILED: 3,
};

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    orderStatus: {
      type: Number,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true,
    },

    paymentStatus: {
      type: Number,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
      index: true,
    },

    expectedDate: Date,

    shippingAddress: {
      type: String,
      required: true,
    },

    // ===============================
    // 🔹 Items
    // ===============================
    items: [
      {
        _id: false,
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ItemMaster",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    // ===============================
    // 🔥 ORDER LOGS (FULL HISTORY)
    // ===============================
    orderLogs: [
      {
        _id: false,

        status: {
          type: Number,
          enum: Object.values(ORDER_STATUS),
          required: true,
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          // required: true,
        },

        role: {
          type: String, // SUPERADMIN / CUSTOMER / SYSTEM
        },

        remarks: String,

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    deliveredAt: Date,

    recordStatus: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },

    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true },
);

orderSchema.index({ customerId: 1, orderDate: -1 });

export const Order = mongoose.model("Order", orderSchema, "orders");
