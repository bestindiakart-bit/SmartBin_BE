import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ItemCategory } from "../models/itemCategory.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";

export class ItemCategoryService {
  async create(data, loggedInUser) {
    try {
      // -------- 0. Owner check --------
      if (!loggedInUser.owner) {
        return {
          success: false,
          data: { message: "Only owner users can create a category" },
          statusCode: 403,
        };
      }

      const { categoryName, description } = data;

      // -------- 1. Required validation --------
      if (!categoryName || !categoryName.trim()) {
        return {
          success: false,
          data: { message: "Category name required" },
          statusCode: 400,
        };
      }

      // -------- 2. Check if category already exists --------
      const exists = await ItemCategory.exists({
        customerId: loggedInUser.customerId,
        categoryName: categoryName.trim(),
        status: STATUS.ACTIVE,
      });

      if (exists) {
        return {
          success: false,
          data: { message: "Category already exists" },
          statusCode: 409,
        };
      }

      // -------- 3. Create category --------
      const category = await ItemCategory.create({
        customerId: loggedInUser.customerId,
        categoryName: categoryName.trim(),
        description: description?.trim(),
        createdBy: loggedInUser.userName,
      });

      // -------- 4. Log activity --------
      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemCategory",
        entityId: category._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created category ${category.categoryName}`,
      });

      return {
        success: true,
        statusCode: 201,
        data: category,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: 500,
      };
    }
  }

  async getAll(query, loggedInUser) {
    try {
      // -------- 0. Owner Check --------
      if (!loggedInUser?.owner) {
        return {
          success: false,
          statusCode: 403,
          data: { message: "Only owner users can view item categories" },
        };
      }

      if (!loggedInUser?.customerId) {
        return {
          success: false,
          statusCode: 401,
          data: { message: "Customer not found in token" },
        };
      }

      // -------- 1. Pagination Handling --------
      let { page = 1, limit = 10 } = query;

      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 100) limit = 100; // safety cap

      const skip = (page - 1) * limit;

      // -------- 2. Filter by customerId and active status --------
      const filter = {
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      };

      // -------- 3. Fetch Categories --------
      const [categories, total] = await Promise.all([
        ItemCategory.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        ItemCategory.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      // -------- 4. Return Response --------
      return {
        success: true,
        statusCode: 200,
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
        statusCode: 500,
        data: { message: error.message },
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      // -------- 0. Owner Check --------
      if (!loggedInUser?.owner) {
        return {
          success: false,
          data: { message: "Only owner users can update item categories" },
          statusCode: 403,
        };
      }

      // -------- 1. Validate ID --------
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // -------- 2. Prepare Update Data --------
      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      if (data.categoryName) {
        updateData.categoryName = data.categoryName.trim();
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      // -------- 3. Update Category --------
      const updated = await ItemCategory.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE 
        },
        updateData,
        { returnDocument: "after", runValidators: true }, // <-- Updated here
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Category not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // -------- 4. Log Activity --------
      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemCategory",
        entityId: id,
        actionType: "Updated",
        description: `${loggedInUser.userName} updated category`,
      });

      // -------- 5. Return Response --------
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
