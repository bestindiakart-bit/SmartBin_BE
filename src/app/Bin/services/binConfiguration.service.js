import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../constants/status.js";
import mongoose from "mongoose";
import { Project } from "../../Project-Master/models/projectMaster.model.js";
import { BinMaster } from "../models/binConfiguration.model.js";
import { ItemMaster } from "../../Item-Master/models/itemMaster.model.js";

export class BinMasterService {
  async create(data, loggedInUser) {
    try {
      const {
        projectId,
        masterId,
        binId,
        supplierItemName,
        binMaxQuantity,
        binMaxWeight,
        safetyStockQuantity,
        rol,
        itemPerPrice,
        weightPerPrice,
        itemMasterId,
      } = data;

      if (!projectId || !masterId || !binId || !itemMasterId) {
        return {
          success: false,
          data: { message: "Required fields missing" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(itemMasterId)
      ) {
        return {
          success: false,
          data: { message: "Invalid ID format" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // Get project
      const project = await Project.findOne({
        _id: projectId,
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      }).lean();

      if (!project) {
        return {
          success: false,
          data: { message: "Project not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // Get item
      const item = await ItemMaster.findOne({
        _id: itemMasterId,
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      }).lean();

      if (!item) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const bin = await BinMaster.create({
        customerId: loggedInUser.customerId,
        customerName: loggedInUser.company,
        projectId,
        projectName: project.projectName,
        masterId,
        binId,
        supplierItemName,
        customerItemName: item.itemName,
        binMaxQuantity,
        binMaxWeight,
        safetyStockQuantity,
        rol,
        itemPerPrice,
        weightPerPrice,
        itemMasterId,
        createdBy: loggedInUser.userName,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          id: bin._id,
          binId: bin.binId,
          projectName: bin.projectName,
          customerItemName: bin.customerItemName,
        },
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
      let { page = 1, limit = 10 } = query;

      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 100) limit = 100; // safety cap

      const skip = (page - 1) * limit;

      const filter = {
        status: STATUS.ACTIVE,
      };

      // Optional: Customer isolation (important for SmartBin multi-tenant)
      if (loggedInUser?.customerId) {
        filter.customerId = loggedInUser.customerId;
      }

      const [records, total] = await Promise.all([
        BinMaster.find(filter)
          .select("-__v")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        BinMaster.countDocuments(filter),
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
          records,
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

      // ---------- 1. Handle Project Change ----------
      if (data.projectId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(data.projectId)) {
          return {
            success: false,
            data: { message: "Invalid project ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const project = await Project.findOne({
          _id: data.projectId,
          status: STATUS.ACTIVE,
        }).lean();

        if (!project) {
          return {
            success: false,
            data: { message: "Project not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        updateData.projectId = data.projectId;
        updateData.projectName = project.projectName;
      }

      // ---------- 2. Handle Item Master Change ----------
      if (data.itemMasterId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(data.itemMasterId)) {
          return {
            success: false,
            data: { message: "Invalid itemMaster ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const item = await ItemMaster.findOne({
          _id: data.itemMasterId,
          status: STATUS.ACTIVE,
        }).lean();

        if (!item) {
          return {
            success: false,
            data: { message: "Item not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        updateData.itemMasterId = data.itemMasterId;
        updateData.customerItemName = item.itemName;
      }

      // ---------- 3. Other Allowed Fields ----------
      const allowedFields = [
        "masterId",
        "binId",
        "supplierItemName",
        "binMaxQuantity",
        "binMaxWeight",
        "safetyStockQuantity",
        "rol",
        "itemPerPrice",
        "weightPerPrice",
        "status",
      ];

      data.status = Number(data.status);

      for (let key of allowedFields) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      // ---------- 4. Update ----------
      const updated = await BinMaster.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
        },
        updateData,
        { new: true, runValidators: true },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Bin not found" },
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
}
