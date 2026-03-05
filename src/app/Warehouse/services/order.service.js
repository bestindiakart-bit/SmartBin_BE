import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Order } from "../models/order.model.js";
import { STATUS } from "../../../constants/status.js";

export class OrderService {
  async getAllOrders(query, loggedInUser) {
    try {
      if (!loggedInUser) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Invalid token data" },
        };
      }

      const isOwner = loggedInUser.owner === true;
      const tokenCustomerId = loggedInUser.customerId?._id;

      const filter = {
        recordStatus: STATUS.ACTIVE,
      };

      // Owner vs Normal User
      if (!isOwner) {
        if (!tokenCustomerId) {
          return {
            success: false,
            statusCode: StatusCodes.FORBIDDEN,
            data: { message: "Customer not found in token" },
          };
        }

        filter.customerId = new mongoose.Types.ObjectId(tokenCustomerId);
      }

      // Filters
      if (query.orderStatus) {
        filter.orderStatus = Number(query.orderStatus);
      }

      if (query.paymentStatus) {
        filter.paymentStatus = Number(query.paymentStatus);
      }

      if (query.fromDate && query.toDate) {
        filter.orderDate = {
          $gte: new Date(query.fromDate),
          $lte: new Date(query.toDate),
        };
      }

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .select(
            "orderId orderDate orderStatus paymentStatus expectedDate shippingAddress items",
          )
          .populate({
            path: "customerId",
            select: "_id customerId companyName",
          })
          .populate({
            path: "items.itemId",
            select: "itemName itemCode",
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Order.countDocuments(filter),
      ]);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          page,
          limit,
          orders,
        },
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }
}
