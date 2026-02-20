import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../constants/status.js";
import { UserType } from "../models/userType.js";
import { buildPermissionsFromRequest } from "../../../utils/permission.util.js";
import { User } from "../models/userMaster.model.js";

export class userTypeService {
  async create(data, loggedInUser) {
    console.log(loggedInUser);
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
      if (id) {
        const role = await UserType.findOne({
          _id: id,
          status: STATUS.ACTIVE,
        })
          .select("userTypeName permissions")
          .lean();

        if (!role) {
          return {
            success: false,
            data: { errors: "Role not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        return {
          success: true,
          data: role,
          statusCode: StatusCodes.OK,
        };
      }

      const roles = await UserType.find({ status: STATUS.ACTIVE })
        .select("userTypeName permissions")
        .lean();

      return {
        success: true,
        data: roles,
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
        { _id: id, status: STATUS.ACTIVE },
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
