import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Bom } from "../models/bom.model.js";
import { STATUS } from "../../../constants/status.js";
import { BinMaster } from "../../Bin/models/binConfiguration.model.js";


export class BomService {
  // =========================================
  // 🔹 CREATE BOM
  // =========================================
  async createBom(body, loggedInUser) {
    try {
      if (!loggedInUser) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Invalid token data" },
        };
      }

      const customerId = body.customerId;

      // Find last BOM for this customer
      const lastBom = await Bom.findOne({ customerId })
        .sort({ createdAt: -1 })
        .select("bomId")
        .lean();

      let nextNumber = 1;

      if (lastBom && lastBom.bomId) {
        const lastNumber = parseInt(lastBom.bomId.split("-")[1]);
        nextNumber = lastNumber + 1;
      }

      // Format like BOM-001
      const bomId = `BOM-${String(nextNumber).padStart(3, "0")}`;

      const bom = await Bom.create({
        ...body,
        bomId,
        createdBy: loggedInUser._id,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: bom,
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  // =========================================
  // 🔹 GET ALL BOMS
  // =========================================
  async getAllBoms(query, loggedInUser) {
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

      if (query.projectId) {
        filter.projectId = new mongoose.Types.ObjectId(query.projectId);
      }

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const [boms, total] = await Promise.all([
        Bom.find(filter)
          .populate("customerId", "_id customerId companyName")
          .populate("projectId", "_id projectName")
          .populate("items.itemId", "itemName itemCode")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Bom.countDocuments(filter),
      ]);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          page,
          limit,
          boms,
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

  // =========================================
  // 🔹 GET SINGLE BOM
  // =========================================

  async getBomById(id, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid BOM id" },
        };
      }

      const bom = await Bom.findOne({
        _id: id,
        recordStatus: STATUS.ACTIVE,
      })
        .populate("customerId", "_id customerId companyName")
        .populate("projectId", "_id projectName")
        .populate("items.itemId", "itemName itemCode")
        .lean();

      if (!bom) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "BOM not found" },
        };
      }

      /* ---------- Get Bin Config ---------- */
      const binConfigs = await BinMaster.find({
        customerId: bom.customerId._id,
        projectId: bom.projectId._id,
        status: STATUS.ACTIVE,
      })
        .select("itemMasterId customerItemName")
        .lean();

      /* ---------- Convert to Map ---------- */
      const itemMap = {};
      binConfigs.forEach((bin) => {
        itemMap[bin.itemMasterId.toString()] = bin.customerItemName;
      });

      /* ---------- Attach customerItemName ---------- */
      bom.items = bom.items.map((item) => ({
        ...item,
        customerItemName: itemMap[item.itemId?._id?.toString()] || null,
      }));

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: bom,
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  // =========================================
  // 🔹 UPDATE BOM
  // =========================================
  async updateBom(id, body, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid BOM id" },
        };
      }

      const updatedBom = await Bom.findOneAndUpdate(
        { _id: id, recordStatus: STATUS.ACTIVE },
        {
          ...body,
          updatedBy: loggedInUser._id,
        },
        { new: true },
      );

      if (!updatedBom) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "BOM not found" },
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: updatedBom,
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  // =========================================
  // 🔹 DELETE BOM (Soft Delete)
  // =========================================
  async deleteBom(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid BOM id" },
        };
      }

      const deletedBom = await Bom.findOneAndUpdate(
        { _id: id, recordStatus: STATUS.ACTIVE },
        { recordStatus: STATUS.DELETED },
        { new: true },
      );

      if (!deletedBom) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "BOM not found" },
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "BOM deleted successfully" },
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  async getItemsByCustomerAndProject(query, loggedInUser) {
    try {
      if (!loggedInUser) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Invalid token data" },
        };
      }

      const { customerId, projectId } = query;

      if (!customerId || !projectId) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "customerId and projectId are required" },
        };
      }

      const filter = {
        recordStatus: STATUS.ACTIVE,
        customerId: new mongoose.Types.ObjectId(customerId),
        projectId: new mongoose.Types.ObjectId(projectId),
      };

      const boms = await Bom.find(filter)
        .populate("items.itemId", "itemName itemCode")
        .lean();

      if (!boms.length) {
        return {
          success: true,
          statusCode: StatusCodes.OK,
          data: [],
        };
      }

      // Collect unique items
      const itemMap = new Map();

      boms.forEach((bom) => {
        bom.items.forEach((item) => {
          if (item.itemId?._id) {
            const id = item.itemId._id.toString();

            if (!itemMap.has(id)) {
              itemMap.set(id, {
                _id: item.itemId._id,
                itemName: item.itemId.itemName,
                itemCode: item.itemId.itemCode,
              });
            }
          }
        });
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: Array.from(itemMap.values()),
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
