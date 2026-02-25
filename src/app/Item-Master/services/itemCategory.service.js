import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ItemCategory } from "../models/itemCategory.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";

export class ItemCategoryService {
  async create(data, loggedInUser) {
    try {
      const { categoryName, description } = data;

      if (!categoryName) {
        return {
          success: false,
          data: { message: "Category name required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const exists = await ItemCategory.exists({
        customerId: loggedInUser.customerId,
        categoryName: categoryName.trim(),
        status: STATUS.ACTIVE,
      });

      if (exists) {
        return {
          success: false,
          data: { message: "Category already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const category = await ItemCategory.create({
        customerId: loggedInUser.customerId,
        categoryName: categoryName.trim(),
        description,
        createdBy: loggedInUser.userName,
      });

      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemCategory",
        entityId: category._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created category ${category.categoryName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: category,
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
      if (!loggedInUser?.customerId) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Customer not found in token" },
        };
      }

      // 🔹 Pagination Handling
      let { page = 1, limit = 10 } = query;

      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 100) limit = 100; // safety cap

      const skip = (page - 1) * limit;

      const filter = {
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      };

      const [categories, total] = await Promise.all([
        ItemCategory.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        ItemCategory.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          records: categories,
        },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: error.message },
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

      if (data.categoryName) updateData.categoryName = data.categoryName.trim();

      if (data.description !== undefined)
        updateData.description = data.description;

      const updated = await ItemCategory.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        },
        updateData,
        { new: true },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Category not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemCategory",
        entityId: id,
        actionType: "Updated",
        description: `${loggedInUser.userName} updated category`,
      });

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
      const deleted = await ItemCategory.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        },
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { message: "Category not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemCategory",
        entityId: id,
        actionType: "Deleted",
        description: `${loggedInUser.userName} deleted category`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Category deleted successfully" },
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
