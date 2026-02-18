import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ItemMaster } from "../models/itemMaster.model.js";
import { STATUS } from "../../../constants/status.js";

export class ItemMasterService {
  async create(data, loggedInUser) {
    console.log(data);
    try {
      const { itemName, productCategory, itemCategory, price } = data;

      if (!itemName) {
        return {
          success: false,
          data: { message: "Item name required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // Auto generate itemId (simple)
      const lastItem = await ItemMaster.findOne()
        .sort({ createdAt: -1 })
        .select("itemId")
        .lean();

      let nextNumber = 1;

      if (lastItem && lastItem.itemId) {
        const lastNum = parseInt(lastItem.itemId.split("-")[1]);
        nextNumber = lastNum + 1;
      }

      const itemId = `SBITEM-${String(nextNumber).padStart(3, "0")}`;

      const item = await ItemMaster.create({
        ...data,
        customerId: loggedInUser.customerId,
        itemId,
        createdBy: loggedInUser.userName,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: item,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAll(query, loggedInUser) {
    try {
      const items = await ItemMaster.find({
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      })
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: items,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getById(id, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const item = await ItemMaster.findOne({
        _id: id,
        customerId: loggedInUser.customerId,
      }).lean();

      if (!item) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: item,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      const updated = await ItemMaster.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
        },
        { ...data, updatedBy: loggedInUser.userName },
        { new: true },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: updated,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(id, loggedInUser) {
    try {
      const deleted = await ItemMaster.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
        },
        { status: STATUS.INACTIVE },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Item deleted successfully" },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
