import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { CustomerType } from "../models/customerType.models.js";
import { STATUS } from "../../../constants/status.js";

export class CustomerTypeService {
  async create(data, loggedInUser) {
    try {
      const { customerTypeName } = data;

      if (!customerTypeName) {
        return {
          success: false,
          data: { message: "Customer type name required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const name = customerTypeName.trim().toUpperCase();

      const exists = await CustomerType.findOne({
        customerTypeName: name,
        status: STATUS.ACTIVE,
      }).lean();

      if (exists) {
        return {
          success: false,
          data: { message: "Customer type already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const type = await CustomerType.create({
        customerTypeName: name,
        createdBy: loggedInUser.userName,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: type,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async get(id) {
    try {
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return {
            success: false,
            data: { message: "Invalid ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const type = await CustomerType.findOne({
          _id: id,
          status: STATUS.ACTIVE,
        }).lean();

        if (!type) {
          return {
            success: false,
            data: { message: "Customer type not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        return {
          success: true,
          statusCode: StatusCodes.OK,
          data: type,
        };
      }

      const types = await CustomerType.find({
        status: STATUS.ACTIVE,
      }).lean();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: types,
      };
    } catch {
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      if (data.customerTypeName) {
        updateData.customerTypeName = data.customerTypeName
          .trim()
          .toUpperCase();
      }

      if (data.status !== undefined) {
        updateData.status = data.status;
      }

      const updated = await CustomerType.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Customer type not found" },
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
      const deleted = await CustomerType.findOneAndUpdate(
        { _id: id, status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] } },
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { message: "Customer type not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Customer type deleted successfully" },
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
