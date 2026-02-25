import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Warehouse } from "../models/warehouse.model.js";
import { User } from "../../CustomerMaster/models/userMaster.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";

export class WarehouseService {
  async create(data, loggedInUser) {
    console.log("data===>",data);
    
    try {
      const {
        warehouseName,
        warehouseLocation,
        warehouseMaxLimit,
        safetyStock,
        reorderRequired,
        supplierName,
        lastTransactionQuantity,
        lastTransactionDate,
      } = data;

      if (!warehouseName?.trim() || warehouseMaxLimit == null) {
        return {
          success: false,
          data: { message: "Warehouse name and max limit required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // const exists = await Warehouse.exists({
      //   customerId: loggedInUser.customerId,
      //   warehouseName: warehouseName.trim(),
      // });

      // if (exists) {
      //   return {
      //     success: false,
      //     data: { message: "Warehouse already exists" },
      //     statusCode: StatusCodes.CONFLICT,
      //   };
      // }

      // Global increment
      const lastWarehouse = await Warehouse.findOne()
        .sort({ createdAt: -1 })
        .select("warehouseId")
        .lean();

      let nextNumber = 1;

      if (lastWarehouse?.warehouseId) {
        const lastNum = parseInt(lastWarehouse.warehouseId.split("-")[1], 10);
        nextNumber = isNaN(lastNum) ? 1 : lastNum + 1;
      }

      const warehouseId = `SBWAREHOUSE-${String(nextNumber).padStart(3, "0")}`;

      const warehouse = await Warehouse.create({
        customerId: loggedInUser.customerId,
        customerName: loggedInUser.userName,
        warehouseId,
        warehouseName: warehouseName.trim(),
        warehouseLocation: warehouseLocation?.trim(),
        warehouseMaxLimit: Number(warehouseMaxLimit),
        safetyStock: Number(safetyStock) || 0,
        reorderRequired: Number(reorderRequired) || 0,
        supplierName: supplierName?.trim(),
        lastTransactionQuantity: Number(lastTransactionQuantity) || 0,
        lastTransactionDate,
        createdBy: loggedInUser.userName,
      });

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: warehouse._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created warehouse ${warehouse.warehouseName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          _id: warehouse._id,
          warehouseId: warehouse.warehouseId,
          warehouseName: warehouse.warehouseName,
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
      const filter = {
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      };

      if (query.id) {
        filter._id = query.id;
      }

      const warehouses = await Warehouse.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: warehouses._id,
        actionType: "Read",
        description: `${loggedInUser.userName} read warehouse ${warehouses.warehouseName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: warehouses,
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid warehouse ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      const allowedFields = [
        "warehouseName",
        "warehouseLocation",
        "warehouseMaxLimit",
        "safetyStock",
        "reorderRequired",
        "supplierName",
        "lastTransactionQuantity",
        "lastTransactionDate",
        "status",
      ];

      for (let key of allowedFields) {
        if (data[key] !== undefined) {
          updateData[key] =
            typeof data[key] === "string" ? data[key].trim() : data[key];
        }
      }

      const updated = await Warehouse.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
        },
        updateData,
        { new: true },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: updated._id,
        actionType: "Updated",
        description: `${loggedInUser.userName} updated warehouse ${updated.warehouseName}`,
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

  async getCustomerWarehouses(query, loggedInUser) {
    try {
      const filter = {
        customerId: query.id,
        status: STATUS.ACTIVE,
      };

      // Optional single warehouse fetch
      if (query.id) {
        if (!mongoose.Types.ObjectId.isValid(query.id)) {
          return {
            success: false,
            data: { message: "Invalid warehouse ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
      }

      const warehouses = await Warehouse.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      if (query.id && warehouses.length === 0) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: warehouses,
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
