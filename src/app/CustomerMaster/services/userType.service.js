import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../constants/status.js";
import { UserType } from "../models/userType.js";
import { buildPermissionsFromRequest } from "../../../utils/permission.util.js";
import { User } from "../models/userMaster.model.js";
import mongoose from "mongoose";

export class userTypeService {
  async create(data, loggedInUser) {
    try {
      const name = data.userTypeName?.trim().toUpperCase();

      if (!name) {
        return {
          success: false,
          data: { errors: "Role name is required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const exists = await UserType.exists({
        userTypeName: name,
        status: STATUS.ACTIVE,
      });

      if (exists) {
        return {
          success: false,
          data: { errors: "Role already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const permissions = buildPermissionsFromRequest(data.permissions);

      const created = await UserType.create({
        userTypeName: name,
        permissions,
        createdBy: loggedInUser.userName,
      });

      return {
        success: true,
        data: {
          id: created._id,
          userTypeName: created.userTypeName,
        },
        statusCode: StatusCodes.CREATED,
      };
    } catch {
      return {
        success: false,
        data: { errors: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async get(id) {
    try {
      const matchStage = {
        status: STATUS.ACTIVE,
      };

      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return {
            success: false,
            data: { message: "Invalid ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        matchStage._id = new mongoose.Types.ObjectId(id);
      }

      const roles = await UserType.aggregate([
        { $match: matchStage },

        {
          $lookup: {
            from: "users", // collection name (check your actual collection)
            localField: "_id",
            foreignField: "userTypeId",
            as: "users",
          },
        },

        {
          $addFields: {
            userCount: {
              $size: {
                $filter: {
                  input: "$users",
                  as: "u",
                  cond: { $eq: ["$$u.status", STATUS.ACTIVE] },
                },
              },
            },
          },
        },

        {
          $project: {
            userTypeName: 1,
            permissions: 1,
            userCount: 1,
          },
        },
      ]);

      if (id && roles.length === 0) {
        return {
          success: false,
          data: { message: "Role not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: id ? roles[0] : roles,
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }
  async update(id, data, loggedInUser) {
    try {
      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      if (data.userTypeName) {
        updateData.userTypeName = data.userTypeName.trim().toUpperCase();
      }

      if (data.permissions) {
        updateData.permissions = buildPermissionsFromRequest(data.permissions);
      }

      const updated = await UserType.findOneAndUpdate(
        { _id: id, status: STATUS.ACTIVE },
        updateData,
        {
          new: true,
          select: "userTypeName permissions",
        },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { errors: "Role not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: updated,
        statusCode: StatusCodes.OK,
      };
    } catch {
      return {
        success: false,
        data: { errors: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
  async delete(id, loggedInUser) {
    try {
      const inUse = await User.exists({
        userTypeId: id,
        status: STATUS.ACTIVE,
      });

      if (inUse) {
        return {
          success: false,
          data: { errors: "Role is assigned to users" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const deleted = await UserType.findOneAndUpdate(
        { _id: id, status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] } },
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
      );

      if (!deleted) {
        return {
          success: false,
          data: { errors: "Role not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: { message: "Role deleted successfully" },
        statusCode: StatusCodes.OK,
      };
    } catch {
      return {
        success: false,
        data: { errors: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
